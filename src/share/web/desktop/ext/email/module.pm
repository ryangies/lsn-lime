# PerlModule

use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::OrderedHash;
use DBI;
use Email::Valid;
use Error qw(:try);
use Error::Logical;
use Mail::Sender;

# ------------------------------------------------------------------------------
# Virtual Mail Internal Admin methods 
# 
# _add_vmail         - Add a virtual mail user
# _delete_vmail      - Delete virtual user from users table
# _add_forwarder     - Add a forwarder for any email address
# _delete_forwarder  - Delete email forwarder for an address
# _list              - List all accounts associated with domain
#
# ------------------------------------------------------------------------------

our ($IP, $DSN, $UN, $PW, $Domain) = ();

our %SQL = (
  sel_alias => q/SELECT destination FROM aliases WHERE mail='%s'/,
  sel_aliases => q/SELECT mail, destination FROM aliases WHERE mail LIKE '%%%s' ORDER BY mail/,
  sel_accounts => q/SELECT id, name FROM users WHERE id LIKE '%%%s' ORDER BY id/,
  sel_account => q/SELECT name FROM users WHERE id='%s'/,
  sel_pw => q/SELECT clear FROM users WHERE id='%s'/,
  sel_email => q/SELECT id FROM users WHERE id='%s'/,
  sel_domain => q/SELECT domain FROM domains WHERE domain='%s'/,
  ins_domain => q/INSERT INTO domains (domain) VALUES ('%s')/,
  ins_account => q/INSERT INTO users (id,name,maildir,clear,crypt) VALUES ('%s','%s','%s', '%s', '%s')/,
  ins_alias => q/INSERT INTO aliases (mail,destination) VALUES('%s','%s')/,
  upd_name => q/UPDATE users SET name='%s' WHERE id='%s'/,
  upd_pw => q/UPDATE users SET clear='%s', crypt='%s' WHERE id='%s'/,
  upd_alias => q/UPDATE aliases SET destination='%s' WHERE mail='%s'/,
  del_alias => q/DELETE FROM aliases WHERE mail='%s'/,
  del_account => q/DELETE FROM users WHERE id='%s'/,
);

# ------------------------------------------------------------------------------
# ACCESS - Hook method called once per request
# ------------------------------------------------------------------------------

sub ACCESS {
  undef $Domain;
  my $u = $$Hub{'/sys/user'} || return;
  return unless $u->is_member('admins');
  # 
  # Example configuration:
  #
  # email => %{
  #   host => 127.0.0.1
  #   driver => mysql
  #   database => vmail
  #   username => mail
  #   password => *****
  # }
  #
  my $conf = $$Hub{'/sys/conf/modules/email'} or die 'Missing email configuration';
  $IP = $$conf{'host'} || '127.0.0.1';
  my $driver = $$conf{'driver'} || 'mysql';
  my $database = $$conf{'database'} || 'vmail';
  $UN = $$conf{'username'} || 'root';
  $PW = $$conf{'password'} || '';
  $DSN = "DBI:$driver:database=$database;host=$IP";
  $Domain = get_domain_root($$conf{'domain'} || $$Hub{'/sys/server/name'});
  return unless $Domain;
  1;
}

# ------------------------------------------------------------------------------
# get_mailurl - Get the mail server for this domain.
# get_mailurl
#
# Not an intelligent method, simply follows our convention.
# ------------------------------------------------------------------------------

sub get_mailurl {
  my ($tld, $domain) = reverse split /\./, $Domain;
  return unless $tld && $domain;
  return "http://mail.$domain.$tld";
}

# ------------------------------------------------------------------------------
# get_email_domain - Get root of domain for an email address
#
#   Email                     Returns
#
#   ryan@example.com          example.com
#   ryan@mail.example.com     example.com
#
# ------------------------------------------------------------------------------

sub get_email_domain {
  my $email = shift or return;
  my (undef,$host) = split(/@/,$email);
  return get_domain_root($host);
}

# ------------------------------------------------------------------------------
# get_domain_root - Get root of domain for HTTP_HOST or email address
# ------------------------------------------------------------------------------

sub get_domain_root {
  my $host = shift or return $Domain;
  my ($ext, $name) = reverse(split(/\./, $host));
  return $name . '.' . $ext;
}

# ------------------------------------------------------------------------------
# is_allowed - Is the current host allowed to update mail records
# ------------------------------------------------------------------------------

sub is_allowed {
  my ($ext,$name,$subd) = reverse(split(/\./,$Domain));
  return !$subd || $subd eq 'www';
}

# ------------------------------------------------------------------------------
# list - List forwards and accounts
# ------------------------------------------------------------------------------

sub list {
  return query(type => 'list');
}

# ------------------------------------------------------------------------------
# query - Handler for query types 
# ------------------------------------------------------------------------------

sub query {
  my ($opts, %params) = my_opts(\@_);
  my %actions = (
    'get_account'       => \&_get_account,
    'get_forwarder'       => \&_get_forwarder,
    'add_vmail'         => \&_add_vmail,
    'update_vmail'         => \&_update_vmail,
    'delete_vmail'      => \&_delete_vmail,
    'add_forwarder'     => \&_add_forwarder,
    'update_forwarder'     => \&_update_forwarder,
    'delete_forwarder'  => \&_delete_forwarder,
    'list'              => \&_list,
  );
  my $dbh = undef;
  return {error => 'Mail may only by managed by the root domain'}
    unless is_allowed();
  return {error => 'Unknown query type.'} unless defined $actions{$params{'type'}};
  return try {
    $dbh = _connect();
    return $actions{$params{'type'}}->($dbh,\%params);
  } catch Error::Logical with {
    return {error => shift->stringify};
  } catch Error::Programatic with {
    return {error => shift->stringify};
  } catch Error with {
    return {error => $!};
  } finally {
    $dbh and $dbh->disconnect();
  };
}

sub _connect {
  #Suppress errors
  my %attr = ( 
      PrintError => 1,
      RaiseError => 1
  );
  # Create connection to database
  my $dbh = undef;
  local $SIG{ALRM} = sub { 
    throw Error::Programatic "Connection to mail server timed out.\n";
  };
  alarm(5);
  $dbh = DBI->connect($DSN, $UN, $PW, \%attr);
  alarm(0);
  return $dbh;
}

# ------------------------------------------------------------------------------
# _add_vmail - Add a virtual mail user
# ------------------------------------------------------------------------------

sub _add_vmail {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  my $name = $$params{'name'};
  my ($username,$domain) = split(/\@/,$email);
  my $users_homedir = "$domain/$username/.maildir/"; # must end w/ a slash
  my $passwd = $$params{'passwd'};
  my $passwd2 = $$params{'passwd2'};

  _email_check($dbh,$email);
  throw Error::Logical "Please enter a name\n" unless $name;
  throw Error::Logical "Passwords do not match\n" unless ($passwd eq $passwd2);
  throw Error::Logical "Password cannot be empty\n" unless $passwd;

  # Ensure the domain exists
  my $sth = $dbh->prepare(sprintf($SQL{sel_domain}, $domain));
  $sth->execute();
  if ($sth->rows == 0) {
    $dbh->do(sprintf($SQL{ins_domain}, $domain));
    $dbh->do(sprintf($SQL{ins_alias}, "\@mail.$domain", "\@$domain"));
    $dbh->do(sprintf($SQL{ins_alias}, "abuse\@$domain", "postmaster\@$domain"));
    $dbh->do(sprintf($SQL{ins_alias}, "postmaster\@$domain", $email));
    warn "Created email domain: $domain\n";
  }

  # Insert the mail account
  my $crypted = _crypt($passwd);
  my $query = sprintf($SQL{ins_account}, $email, $name, "$users_homedir", $passwd, $crypted);
  $dbh->do($query) or throw Error::Logical "Error in sql query: $query\n";

  return {};
}

sub _get_account {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  _validate_address($email);
  _validate_domain($email);
  my $sth = $dbh->prepare(sprintf($SQL{sel_account}, $email));
  $sth->execute();
  throw Error::Logical "No such account: $email" unless $sth->rows > 0;
  my ($name) = $sth->fetchrow_array;
  return {name =>$name};
}

sub _get_forwarder {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  _validate_address($email);
  _validate_domain($email);
  my $sth = $dbh->prepare(sprintf($SQL{sel_alias}, $email));
  $sth->execute();
  throw Error::Logical "No such forwarder: $email" unless $sth->rows > 0;
  return $sth->fetchrow_hashref;
}

sub _update_vmail {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  _validate_address($email);
  _validate_domain($email);
  my $sth = $dbh->prepare(sprintf($SQL{sel_email}, $email));
  $sth->execute();
  throw Error::Logical "No such account: $email" unless $sth->rows > 0;
  my %values = ();
  # Full Name
  if (my $name = $$params{'name'}) {
    $dbh->prepare(sprintf($SQL{upd_name}, $name, $email))->execute();
  }
  # Password
  if (my $passwd = $$params{'passwd'}) {
    throw Error::Logical "Passwords do not match\n"
      unless ($passwd eq $$params{'passwd2'});
    my $crypted = _crypt($passwd);
    $dbh->prepare(sprintf($SQL{upd_pw}, $passwd, $crypted, $email))->execute();
  }
  return {};
}

sub _update_forwarder {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  _validate_address($email);
  _validate_domain($email);
  my $sth = $dbh->prepare(sprintf($SQL{sel_alias}, $email));
  $sth->execute();
  throw Error::Logical "No such account: $email" unless $sth->rows > 0;
  if (my $dest = $$params{'forward'}) {
    _validate_address($dest);
    $dbh->prepare(sprintf($SQL{upd_alias}, $dest, $email))->execute();
  } else {
    throw Error::Logical "Email forwards must specify a destination";
  }
  return {};
}

sub _validate_address {
  throw Error::IllegalArg unless Email::Valid->address(shift);
}

sub _validate_domain {
  my $dom = get_email_domain(shift);
  throw Error::Logical "Unauthorized domain: $dom\n"
    unless $Domain eq $dom;
}

# ------------------------------------------------------------------------------
# _delete_vmail - Delete virtual user from users table
# Does not delete maildir. Need to do this manually later.
# ------------------------------------------------------------------------------

sub _delete_vmail {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  my $query = sprintf($SQL{del_account}, $email);
  $dbh->do($query) or warn "Error in sql query: $query\n";
  return {};
}

# ------------------------------------------------------------------------------
# _add_forwarder - Add a forwarder for any email address
# ------------------------------------------------------------------------------

sub _add_forwarder {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  my $forward = $$params{'forward'};
  if(!Email::Valid->address($forward) || ($email eq $forward)) {
    throw Error::Logical "This is an invalid forward address: $forward\n";
  }
  _email_check($dbh,$email);
  my $query = sprintf($SQL{ins_alias}, $email, $forward);
  if(!$dbh->do($query)) {
    throw Error::Logical "Error in sql query: $query\n";
  }
  return {};
}

# ------------------------------------------------------------------------------
# _delete_forwarder - Delete email forwarder for an address
# ------------------------------------------------------------------------------

sub _delete_forwarder {
  my $dbh = shift;
  my $params = shift;
  my $email = $$params{'email'};
  my $query = sprintf($SQL{del_alias}, $email);
  if(!$dbh->do($query)) {
    warn "Error in sql query!\n$query\n";
  }
  return {};
}

# ------------------------------------------------------------------------------
# _list - List all accounts associated with this domain
# ------------------------------------------------------------------------------

sub _list {
  my $dbh = shift;
  my %data = (
    users => Data::OrderedHash->new(),
    forwards => Data::OrderedHash->new(),
  );
  my $sth = $dbh->prepare(sprintf($SQL{sel_accounts}, $Domain));
  $sth->execute();
  if($sth->rows != 0) {
    while ( my $ref = $sth->fetchrow_arrayref()) {
      $data{'users'}{$ref->[0]} = $ref->[1];
    }
  }
  $sth->finish();
  
  my $sth = $dbh->prepare(sprintf($SQL{sel_aliases}, $Domain));
  $sth->execute();
  if($sth->rows != 0) {
    while (my $ref = $sth->fetchrow_arrayref()) {
      my ($from, $to) = @$ref;
#     my ($un, $d) = split '@', $from;
#     next unless $un;
      $data{'forwards'}{$from} = $to;
    }
  }
  $sth->finish();
  $Hub->set('/sys/response/headers/<next>', ['Cache-Control', 'no-cache']);
  return \%data;
}


# ------------------------------------------------------------------------------
# _email_check - Check if adding forward for this email is valid
# _email_check $dbh, $email, $must_exist
# where:
#   $dbh          db connection
#   $email        email address
# ------------------------------------------------------------------------------

sub _email_check {
  my $dbh = shift;
  my $email = shift;
  throw Error::Logical "This is an invalid email address\n"
    unless Email::Valid->address($email);
  my $email_domain = get_email_domain($email);
  throw Error::Logical "You cannot add emails for: $email_domain\n" unless
    $Domain eq $email_domain;
  my $check1 = $dbh->prepare(sprintf($SQL{sel_alias}, $email));
  $check1->execute();
  my $check2 = $dbh->prepare(sprintf($SQL{sel_account}, $email));
  $check2->execute();
  if($check1->rows != 0 or $check2->rows !=0) {
    throw Error::Logical "This address is already in use\n";
  }
}

# ------------------------------------------------------------------------------
# _crypt - Crypt the plain text with random salt
# ------------------------------------------------------------------------------

sub _crypt {
  my $plaintext = shift;
  my @saltsource = ('a'..'z', 'A'..'Z', '0'..'9','.','/');
  my $randum_num = int(rand(scalar @saltsource));
  my $salt = $saltsource[$randum_num];
  $randum_num = int(rand(scalar @saltsource));
  $salt .= $saltsource[$randum_num];
  crypt($plaintext, $salt);
}

1;
