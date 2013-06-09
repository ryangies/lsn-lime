# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Error::Logical;
use Data::Hub qw($Hub);
use Data::OrderedHash;
use Data::Hub::Util qw(:all);

our @Fields = qw(un password.sha1 groups email real_name);

sub ACCESS {
  return unless $Hub->{'/sys/user'}->is_admin();
  1;
}

sub fields {
  my $extra = $Hub->get('/sys/conf/modules/users/extra_fields');
  $extra ? [@Fields, @$extra] : [@Fields];
}

sub list {
  my $result = [];
  my $users = $Hub->get('/sys/users') or return;
  my $fields = fields();
  $users->iterate(sub {
    my ($un, $data) = @_;
    my $values = {};
    for (@$fields) {
      $values->{$_} = $$data{$_} if exists $$data{$_};
    }
    $values->{'un'} = $un;
    push @$result, $values;
  });
  return {
    fields => $fields,
    rows => [sort {$a->{un} cmp $b->{un}} @$result],
  };
}

sub save {
  my ($opts, %params) = my_opts(\@_);
  my $un = $params{un};
  my $key = $params{key} or throw Error::MissingArg '$key';
  my $value = $params{value};
  my $addr = addr_normalize("/sys/users/$un/$key");
  throw Error::Security unless index($addr, '/sys/users/') == 0;
  if ($key eq 'un') {
    # if no $un and $key is 'un' a new user is created
    throw Error::MissingArg '$value' unless $value;
    throw Error::Logical 'User exists' if $Hub->get("/sys/users/$value");
    my $user = $un ? $Hub->get("/sys/users/$un") : {};
    throw Error::Logical 'User exists' if $Hub->get("/sys/users/$value");
    $Hub->set("/sys/users/$value", $user);
    $Hub->delete("/sys/users/$un") if $un;
  } else {
    throw Error::MissingArg '$un' unless $un;
    throw Error::Logical 'User does not exist' unless $Hub->get("/sys/users/$un");
    $Hub->set($addr, $value);
  }
  $Hub->addr_to_storage('/sys/users')->save();
  'SUCCESS';
}

sub remove {
  my ($opts, %params) = my_opts(\@_);
  my $un = $params{un} or throw Error::MissingArg '$un';
  my $addr = addr_normalize("/sys/users/$un");
  throw Error::Security unless index($addr, '/sys/users/') == 0;
  $Hub->delete($addr);
  $Hub->addr_to_storage('/sys/users')->save();
  'SUCCESS';
}

1;
