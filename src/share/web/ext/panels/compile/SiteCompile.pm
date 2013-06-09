# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::OrderedHash;
use Data::Format::Hash qw(hf_format);

# Local web-request modules
use IO::File;
use LWP::UserAgent;
use Fcntl qw(:flock);

# Selects all local files which will be included
our $QUERY_ALL = '**|{?(!~i):\.(ht|hf|def|t)$}';

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  $u->is_member('admins');
}

sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  my $self = bless {
    stream => shift,
    config => shift,
  }, $class;
  $$self{settings} = $$self{config}->get_config;
  $self;
}

sub get_query_all {
  my $self = shift;
  my $query = $$self{settings}{query_all} || $QUERY_ALL;
  $query;
}

sub _die {
  my $self = shift;
  $self->{stream}->report('error', @_);
  throw Error::Programatic @_;
}

sub query_local {
  my $self = shift;
  $self->{stream}->report('status', 'Query local');
  my $local_root_addr = $$self{settings}{local_root} || '/';
  my $local_root_addr_length = length($local_root_addr);
  my $local_root = $Hub->get(addr_normalize("$local_root_addr"));
  my $includes = $$self{settings}{includes} || '';
  my $excludes = $$self{settings}{excludes} || '';
  my $ignore = $$self{settings}{ignore} || '';
  my $subset = $local_root->get($self->get_query_all());
  my @files = $subset->values;
  my @excludes = split(/[\r\n]+/, $excludes);
  my @ignore = split(/[\r\n]+/, $ignore);
  my @includes = split(/[\r\n]+/, $includes);
  my $selection = Data::OrderedHash->new();
  foreach my $file (@files) {
    my $path = substr $file->get_addr, $local_root_addr_length;
    my $status = 'Include';
    if (grep_first {$path =~ $_} @ignore) {
      $status = 'Ignore';
    } elsif (grep_first {$path =~ $_} @excludes) {
      $status = 'Exclude';
    } else {
      $status = 'Include';
      $selection->{$path} = {'status' => $status};
    }
    $self->{stream}->report('update', $path, $status);
  }
  foreach my $spec (@includes) {
    my $subset = $local_root->get($spec);
    my @files = isa($subset, FS('Node')) ? $subset : $subset->values;
    foreach my $file (@files) {
      my $path = substr $file->get_addr, $local_root_addr_length;
      my $status = 'Include';
      $selection->{$path} = {'status' => $status};
      $self->{stream}->report('update', $path, $status);
    }
  }
  $selection;
}

sub fetch_local {
  my $self = shift;
  my $selection = shift;
  $self->{stream}->report('status', 'Fetching local');
  my @paths = $selection->keys;
  my $compile = $$self{settings}{compile} || '';
  my @compile = split(/[\r\n]+/, $compile);
  my $tmpdir = $self->{config}->get_out_path;
  my $host = sprintf 'http://%s:%s',
    $Hub->get('/sys/server/name'),
    $Hub->get('/sys/server/port');
  foreach my $path (@paths) {
    my $do_compile = grep_first {$path =~ $_} @compile;
    my $status;
    if ($do_compile) {
      $status = $self->_wget($host, $tmpdir, $path) ? 'Compiled' : 'Error';
    } else {
      $status = $self->_copy($tmpdir, $path) ? 'Copied' : 'Error';
    }
    $selection->{$path} = {'status' => $status};
    $self->{stream}->report('update', $path, $status);
  }
  $selection;
}

sub delete_local {
  my $self = shift;
  my $status;
  my $status_text;
  my $opts = my_opts(\@_);
  my $dir = $self->{config}->get_out_path;
  $self->{stream}->report('status', 'Delete local');
  if (-d "$dir/.svn" || -d "$dir/.git" || -d "$dir/CVS") {
    $status_text = 'Under version control';
    $status = 'Preserved';
  } else {
    dir_remove($dir);
    $status_text = 'Deleted';
    $status = 'Deleted';
  }
  $self->{stream}->report('update', $dir, $status_text) unless $$opts{quiet};
  return {
    $dir => {'status' => $status},
  };
}

sub _wget {
  my $self = shift;
  my $host = shift;
  my $tmpdir = shift;
  my $path = shift;
  my $out_path = "$tmpdir/$path";
  my $dir = path_parent($out_path);
  my $root = $$self{settings}{local_root} || '/';
  my $uri = addr_normalize("$host/$root/$path");
  # TODO Set the If-Modified-Since header, then inspect the status
  # to glean the is-modified status.
  my $ua = LWP::UserAgent->new;
  my $r = $ua->get($uri);
  if ($r->is_success) {
    my $type = $r->header('Content-Type');
    my $is_binary = $type !~ /^(text|data)\//;
    $self->{config}->errlog("compile: type=$type is_binary=$is_binary out=$out_path");
    dir_create($dir);
    if ($is_binary) {
      file_write_binary($out_path, $r->content);
    } else {
      my $c = $r->decoded_content;
      chomp $c;
      $c .= "\n";
      file_write($out_path, $c);
    }
    return $out_path;
  }
  undef;
}

sub _copy {
  my $self = shift;
  my $tmpdir = shift;
  my $path = shift;
  my $out_path = "$tmpdir/$path";
  my $dir = path_parent($out_path);
  my $root = $$self{settings}{local_root} || '/';
  my $addr = addr_normalize("$root/$path");
  if (my $file = $$Hub{$addr}) {
    dir_create($dir);
    file_copy($file->get_path, $out_path);
    return $out_path;
  }
  undef;
}

1;
