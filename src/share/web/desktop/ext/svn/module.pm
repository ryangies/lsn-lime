# PerlModule

# 
# This module interfaces with the Subversion command-line client.
#
# TODO
#
#   * Use the -xml switch for parsing output.
#   * Capture STDERR
#
# IMPORTANT
#
#   The path which is sent to subversion commands must be an absolute path
#     - b/c a substr is done on it
#     - b/c the regex wich slurps flags thinks '/' begins the path
#

use strict;
use Perl::Module;
use Apache2::ServerUtil;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Hub::Container;
use Encode qw(is_utf8);
use Error qw(:try);
use WWW::Livesite::OutputStream;

our $Conf_Key = 'svn';
our $Stream;

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  $Stream = WWW::Livesite::OutputStream->new();
  1;
}

sub get_config {
  my $params = $Hub->get('/sys/request/cgi') || {};
  my $hash = clone($Hub->get("/sys/conf/modules/$Conf_Key") || {}, -pure_perl);
  overlay($hash, $params);
  $$hash{path} = path_normalize($$hash{path}) if ($$hash{path});
  $$hash{local_root} = path_normalize($$hash{local_root}) if ($$hash{local_root});
  $hash;
}

sub set_config {
  $Hub->get('/sys/cfgldr')->write_hash("modules/$Conf_Key", get_config());
}

sub _get_module_config {
  $Hub->get('/sys/conf/modules/svn');
}

sub _get_document_root {
  my $r = $Hub->get('/sys/request/obj');
  $r->document_root();
}

sub _get_root {
  return $Hub->get('/sys/conf/modules/svn/root_path') || _get_document_root();
}

# ------------------------------------------------------------------------------
# Entry Points
# ------------------------------------------------------------------------------

sub list_contexts {
  my $conf = _get_module_config();
  my $result = {
    default => '',
    options => [],
  };
  if ($conf) {
    my $root = _get_module_config()->{'root'};
    foreach my $k (keys %$root) {
      $result->{'default'} ||= $k;
      push @{$result->{'options'}}, {
        value => $k,
        text => $root->{$k},
      };
    }
  } else {
    my $path = _get_document_root() or die 'Cannot get document root';
    $result->{'default'} = 'current';
  }
  $result;
}

sub exec {
  my $command = $Hub->get('/sys/request/cgi/command');
  _exec($command, _get_root());
}

sub diff {
  my $root = _get_root();
  my $path = $Hub->get('/sys/request/cgi/path');
  _exec('diff', path_normalize("$root/$path"));
}

sub _exec {
  my $t1 = [gettimeofday];
  my @args = @_;
  try {
    $Stream->append(['status', "Starting"]);
    svn_exec(@args);
  } otherwise {
    $Stream->append(['error', '' . $@]);
  } finally {
    my $t2 = [gettimeofday];
    my $delta = tv_interval($t1, $t2);
    $Stream->append(['status', "Finished ($delta seconds)"]);
  };
}

sub info {
  svn_info(_get_root());
}

sub status {
  $Stream->append(svn_status(_get_root()));
}

sub status2 {
  svn_exec('status', _get_root());
}

sub update {
  svn_update(_get_root());
}

our %Commit_Handlers = ();
our @Commit_Order = qw(replace destroy remove ignore add commit);

sub commit {
  my $cgi = $Hub->get('/sys/request/cgi');
  my $input = {};
  for (keys %$cgi) {
    my ($type, $uid) = /^(action|item):(.*)$/;
    next unless $type;
    $input->{$type}{$uid} = $cgi->{$_};
  }
  my $comment = _escape($cgi->{comment} || '');
  my $todo = {};
  my $items = $input->{'item'};
  if ($items && %$items) {
    my $root = _get_root();
    my $actions = $input->{'action'};
    my $status = svn_status(_get_root());
    foreach my $entry (@$status) {
      if (my $path = $items->{$entry->{'uid'}}) {
        $path = path_normalize("$root/$path");
        my $action = $actions->{$entry->{'uid'}};
        my $bucket = $todo->{$action} ||= [];
        push @$bucket, $path;
      }
    }
  }

  foreach my $action (@Commit_Order) {
    my $paths = $todo->{$action} or next;
    foreach my $path (@$paths) {
      my $sub = $Commit_Handlers{$action} or die 'No such action';
      &$sub($path, $comment);
    }
  }
}

sub _escape {
  my $octets = is_utf8($_[0]) ? Encode::encode('UTF-8', $_[0]) : $_[0];
  $octets =~ s/([^A-Za-z0-9_\s])/sprintf("%%%02X", ord($1))/eg;
  $octets;
}

$Commit_Handlers{'replace'} = sub {
  my ($path, $comment) = @_;
  my $ppath = path_parent($path);
  my $name = path_name($path);
  my $uid = $name . '-svn-replace-' . int(rand(2 ** 16));
  my $tmp = path_normalize("$ppath/$uid");
  if (-d $path) {
    dir_move $path, $tmp;
  } else {
    file_move $path, $tmp;
  }
  svn_update($path);
  svn_remove($path);
  svn_commit($path, $comment);
  svn_update($ppath);
  if (-d $path) {
    dir_move $tmp, $path;
  } else {
    file_move $tmp, $path;
  }
  svn_add($path);
  svn_commit($path, $comment);
  svn_resolve($path);
};

$Commit_Handlers{'remove'} = sub {
  my ($path, $comment) = @_;
# dir_remove($path) if -d $path;
# file_remove($path) if -f $path;
# See 'destroy'
# svn_update(path_parent($path));
  svn_remove($path);
  svn_commit($path, $comment);
# See 'destroy'
# svn_resolve($path);
};

$Commit_Handlers{'destroy'} = sub {
  my ($path, $comment) = @_;
  dir_remove($path) if -d $path;
  file_remove($path) if -f $path;
  svn_update(path_parent($path));
  svn_remove($path);
  svn_commit($path, $comment);
  svn_resolve($path);
};

$Commit_Handlers{'add'} = sub {
  my ($path, $comment) = @_;
  svn_add($path);
  svn_commit($path, $comment);
};

$Commit_Handlers{'commit'} = sub {
  my ($path, $comment) = @_;
  svn_commit($path, $comment);
};

$Commit_Handlers{'skip'} = sub {
  my ($path, $comment) = @_;
  ["-       $path"];
};

$Commit_Handlers{'revert'} = sub {
  my ($path, $comment) = @_;
  svn_revert($path);
};

$Commit_Handlers{'ignore'} = sub {
  my ($path, $comment) = @_;
  svn_ignore($path);
};

# ------------------------------------------------------------------------------
# Subversion Execution
#
# TODO: Server-side configuration:
#   command="svnserve -t",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty';
#   http://svnbook.red-bean.com/en/1.1/svn-book.html#svn-ch-6-sect-3.4
#   http://svnbook.red-bean.com/en/1.1/svn-book.html#svn-ch-6-sect-5
# ------------------------------------------------------------------------------

our %SVN_Commands = (
  info => 'info "%s"',
  status => 'status "%s" --no-ignore',
  add => 'add "%s"',
  update => 'update "%s"',
  remove => 'remove "%s"',
  revert => 'revert "%s"',
  resolve => 'resolve --accept=theirs-conflict "%s"',
  commit => 'commit "%s" -m \'%s\'',
  fullstatus => 'status -u -v %s',
  propget => 'propget %s %s %s',
  propset => 'propset %s %s %s',
  diff => 'diff "%s"',
);

sub svn_get_command {
  my @command = ();
  if (my $sock = $$Hub{'/sys/ENV/SSH_AUTH_SOCK'}) {
    push @command, "SSH_AUTH_SOCK=$sock";
  }
  push @command, 'svn';
  push @command, '--non-interactive', '--config-dir', '/tmp';
  return join ' ', @command;
}

sub svn_capture {
  my $action = shift;
  my $result = [];
  my $svn = svn_get_command();
  my $cmd_line = $SVN_Commands{$action} or die "Unknown subversion command";
  my $cmd = sprintf $cmd_line, @_;
  open(RESULT, "$svn $cmd 2>&1 |") or die "Cannot fork: $!";
  while (<RESULT>) {
    chomp;
    push @$result, $_;
  }
  close RESULT;
  return $result;
}

sub svn_exec {
  my $action = shift;
  my $svn = svn_get_command();
  my $cmd_line = $SVN_Commands{$action} or die "Unknown subversion command";
  my $cmd = sprintf $cmd_line, @_;
# $Stream->append(['status', "$svn $cmd"]);
  open(RESULT, "$svn $cmd 2>&1 |") or die "Cannot fork: $!";
  while (<RESULT>) {
    chomp;
    $Stream->append(['result', $_]);
  }
  close RESULT;
}

sub svn_ignore {
  my ($path, $comment) = @_;
  my $target = path_parent($path);
  my $name = path_name($path);
  my $lines = svn_capture('propget', 'svn:ignore', $target);
  push @$lines, $name;
  my $tmp = "$target/.svn/ignore.tmp";
  file_write($tmp, join("\n", @$lines));
  svn_exec('propset', 'svn:ignore', "--file '$tmp'", $target);
  svn_exec('commit', $target, $comment);
}

sub svn_revert {
  svn_exec('revert', @_);
}

sub svn_resolve {
  svn_exec('resolve', @_);
}

sub svn_update {
  svn_exec('update', @_);
}

sub svn_add {
  svn_exec('add', @_);
}

sub svn_remove {
  svn_exec('remove', @_);
}

sub svn_commit {
  svn_exec('commit', @_);
}

sub svn_info {
  svn_exec('info', $@);
}

sub svn_status {
  my $path = shift;
  my $result = [];
  my $out = svn_capture('status', $path);
  for (@$out) {
    if (s/^svn: //) {
      push @$result, {output => $_};
      next;
    }
    my ($status, $item_path) = /^([^\/]+)(.*)$/;
    $status =~ s/\s//g;
    next if $status eq '>';
    $status = 'o' if ($status eq '+C');
    my $addr = substr($item_path, length($path));
    my $exists = $Hub->get($addr) ? 1 : 0;
    push @$result, {
      output => $_,
      exists => $exists,
      status => $status,
      path => $addr,
      uid => checksum($status, $addr),
    };
  }
  $result;
}

1;
