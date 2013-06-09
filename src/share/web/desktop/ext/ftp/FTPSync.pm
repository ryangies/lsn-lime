# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::OrderedHash;
use Data::Format::Hash qw(hf_format);

# FTP transfer modules
use Net::FTP;
use Net::FTP::File;

# Local web-request modules
use IO::File;
use LWP::UserAgent;
use Fcntl qw(:flock);

# Selects all local files which will be transfered
our $QUERY_ALL = '**|{?(=~i):\.(html?|xml|jpe?g|gif|png|css|js)$}';

sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  bless {
    stream => shift,
    config => shift,
  }, $class;
}

sub get_config {
  my $self = shift;
  my $k = shift;
  my $config = $self->{'config'};
  return defined $k ? $$config{$k} : $config;
}

sub get_query_all {
  my $self = shift;
  my $query = $self->get_config('query_all') || $QUERY_ALL;
  $query;
}

sub _die {
  my $self = shift;
  $self->send_status('error', @_);
  throw Error::Programatic @_;
}

sub send_status {
  my $self = shift;
  my $type = shift;
  my $part = {
    'type' => $type,
    'args' => \@_,
  };
  $self->{stream}->append($part);
}

sub is_mirrored {
  my $self = shift;
  $Hub->get("/sys/tmp/ext/ftp/remote") ? 1 : 0;
}

sub test_connection {
  my $self = shift;
  my $ftp = $self->_connect();
  $ftp->quit();
  1;
}

sub fetch_remote {
  my $self = shift;
  my $tmpdir = shift || $self->_tmp_dir('remote');
  my $ftp = $self->_connect();
  my $entries = $self->_list_recursive($ftp, $$self{config}{path});
  foreach my $path (keys %$entries) {
    my $props = $$entries{$path};
    my $tmppath = $$props{'tmp'} = path_normalize("$tmpdir/$path");
    if (my $stat = stat $tmppath) {
      my $lbytes = $stat->size;
      my $rbytes = $$props{'bytes'};
      my $eq_size = ($lbytes - $rbytes) == 0;
#warn sprintf("%s %s\n", $eq_size ? ' ' : '!', $path);
      if ($eq_size) {
        $self->send_status('update', $path, 'skipped');
        $$props{'status'} = 'skipped';
        next;
      }
    }
    my $ldir = path_parent($tmppath);
    dir_create($ldir);
    $self->_ftp_mode($ftp, $path);
    if ($ftp->get($self->_addr_to_rpath($path), $tmppath)) {
      $$props{'status'} = 'fetched';
    } else {
      $$props{'status'} = 'failed';
    }
    $self->send_status('update', $path, $$props{'status'});
  }
  $ftp->quit;
  return $entries;
}

sub query_local {
  my $self = shift;
  my $local_root = $$self{config}{local_root} || '/';
  my $resources = $$self{config}{resources} || '';
  my $excludes = $$self{config}{excludes} || '';
  my $files = $Hub->get(addr_normalize("$local_root/" . $self->get_query_all()));
  my @paths = $files->keys;
  my @excludes = split(/[\r\n]+/, $excludes);
  my $result = Data::OrderedHash->new();
  foreach my $path (@paths) {
    my $ok = !grep_first {$path =~ $_} @excludes;
    my $status = $ok ? 'Include' : 'Exclude';
    $ok and $result->{$path} = {'status' => $status};
    $self->send_status('update', $path, $status);
  }
  $result;
}

sub fetch_local {
  my $self = shift;
  my @paths = $self->query_local->keys;
  my $compile = $$self{config}{compile} || '';
  my @compile = split(/[\r\n]+/, $compile);
  my $result = Data::OrderedHash->new();
  my $tmpdir = $self->_tmp_dir('local');
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
    $result->{$path} = {'status' => $status};
    $self->send_status('update', $path, $status);
  }
  $result;
}

sub compare {
  my $self = shift;
  my $opts = my_opts(\@_);
  my $dir_local = Data::Hub->new($self->_tmp_dir('local'));
  my $dir_remote = Data::Hub->new($self->_tmp_dir('remote'));
  my $list_local = $dir_local->get('**');
  my $list_remote = $dir_remote->get('**');
  my $result = Data::OrderedHash->new();
  $list_local->iterate(sub {
    my ($addr, $node_local) = @_;
    my $node_remote = $list_remote->{$addr};
    my $action = '';
    if ($node_remote) {
      # File is modified if it differs and should be replaced
      $action = 'M' if system('diff', $node_local->get_path, $node_remote->get_path);
      delete $list_remote->{$addr};
    } else {
      # File is missing from the remote list and should be added
      $action = 'A';
    }
    $result->{$addr} = {
      'status' => $action,
      'LocalFile' => $node_local,
      'RemoteFile' => $node_remote,
    };
    $self->send_status('update', $addr, $action || 'No Change') unless $$opts{quiet};
  });
  $list_remote->iterate(sub {
    # Any entries remaining in the remote list do note exist locally and should 
    # be deleted
    my ($addr, $node_remote) = @_;
    $result->{$addr} = {
      'status' => 'D',
      'LocalFile' => undef,
      'RemoteFile' => $node_remote,
    };
    $self->send_status('update', $addr, 'D') unless $$opts{quiet};
  });
  $result;
}

sub fetch_remote_into_working () {
  my $self = shift;
  my $dir = $self->_working_dir();
  $self->fetch_remote($dir);
}

sub backup_working {
  my $self = shift;
  my $bak = $self->_bak_dir('working');
  my $dir = $self->_working_dir();
  dir_copy($dir, $bak);
  $self->send_status('update', $bak, 'Created');
  return {
    $bak => {'status' => 'Created'},
  };
}

sub backup_remote {
  my $self = shift;
  my $dir = $self->_tmp_dir('remote');
  my $bak = $self->_bak_dir('remote');
  dir_copy($dir, $bak);
  $self->send_status('update', $bak, 'Created');
  return {
    $bak => {'status' => 'Created'},
  };
}

sub delete_remote {
  my $self = shift;
  my $dir = $self->_tmp_dir('remote');
  dir_remove($dir);
  $self->send_status('update', $dir, 'Deleted');
  return {
    $dir => {'status' => 'Deleted'},
  };
}

sub delete_local {
  my $self = shift;
  my $opts = my_opts(\@_);
  my $dir = $self->_tmp_dir('local');
  dir_remove($dir);
  $self->send_status('update', $dir, 'Deleted') unless $$opts{quiet};
  return {
    $dir => {'status' => 'Deleted'},
  };
}

sub upload_changes {
  my $self = shift;
  my $diff = $self->compare(-quiet);
  my $dir_remote = new Data::Hub($self->_tmp_dir('remote'));
  my $dir_local = new Data::Hub($self->_tmp_dir('local'));
  my $dir_remote_path = $dir_remote->get('/')->get_path;
  my $result = Data::OrderedHash->new();
  my $ftp = $self->_connect();
  $self->send_status('update', 'STATUS', 'Uploading');
  foreach my $addr (keys %$diff) {
    my $paddr = path_parent($addr);
    my $action = $$diff{$addr}{'status'} or next;
    my $status = 'Error';
    my $remote_path = $self->_addr_to_rpath($addr);
    my $mirror_dir = path_normalize($dir_remote_path . '/' . $paddr);
    my $mirror_path = path_normalize($dir_remote_path . '/' . $addr);
    $self->_log("FTP: action=$action; addr=$addr; remote_path=$remote_path");
    $self->send_status('update', $addr, 'Transfering');
    unless ($dir_remote->get($paddr)) {
      my $remote_dir = $self->_addr_to_rpath($paddr);
      $ftp->mkdir($remote_dir, 1);
    }
    if ($action eq 'A' || $action eq 'M') {
      # Put the file on the remote server
      my $file = $$diff{$addr}{'LocalFile'};
      if ($self->_put($ftp, $file, $remote_path)) {
        $status = "Put";
        # Copy the file to the local
        my $src_path = $file->get_path;
        $self->_log("FTP: copy $src_path -> $mirror_path");
        dir_create($mirror_dir);
        file_copy($src_path, $mirror_path);
      }
    } elsif ($action eq 'D') {
      if ($ftp->delete($remote_path)) {
        $status = 'Removed';
        $self->_log("FTP: remove: $mirror_path");
        file_remove($mirror_path);
      }
    }
    $result->{$addr} = {'status' => "$action-$status: $remote_path"};
    $self->send_status('update', $addr, $status);
  }
  $self->_prune_empty_dirs($ftp, $result);
  $ftp->quit;
  $result;
}

sub _prune_empty_dirs {
  my $self = shift;
  my $ftp = shift;
  my $result = shift || Data::OrderedHash->new();
  my $dir_remote = new Data::Hub($self->_tmp_dir('remote'));
  my $dir_local = new Data::Hub($self->_tmp_dir('local'));
  my $dirs = $dir_remote->get('/**/{-d}');
  my @list = ();
  foreach my $dir ($dirs->values) {
    my $addr = $dir->get_addr;
    my $paddr = addr_parent($addr);
    while ($paddr && !$dir_local->get($paddr)) {
      $addr = $paddr;
      $paddr = addr_parent($addr);
    }
    next if grep_first {$_ eq $addr}, @list;
    push @list, $addr;
  }
  my $root = $dir_remote->get('/')->get_path;
  foreach my $addr (@list) {
    my $remote_path = $self->_addr_to_rpath($addr);
    my $status = 'Error';
    if ($ftp->rmdir($remote_path, 1)) {
      $status = 'Removed';
      my $path = path_normalize("$root/$addr");
      dir_remove($path);
    }
    $result->{$addr} = {'status' => $status};
    $self->send_status('update', $addr, $status);
  }
  $result;
}

sub _put {
  my $self = shift;
  my $ftp = shift;
  my $file = shift;
  my $remote_path = shift;
  $self->_ftp_mode($ftp, $file);
  my $local_path = $file->get_path;
#warn "put($local_path, $remote_path);";
  $ftp->put($local_path, $remote_path);
}

sub _wget {
  my $self = shift;
  my $host = shift;
  my $tmpdir = shift;
  my $path = shift;
  my $out_path = "$tmpdir/$path";
  my $dir = path_parent($out_path);
  my $root = $$self{config}{local_root} || '/';
  my $uri = addr_normalize("$host/$root/$path");
  # TODO Set the If-Modified-Since header, then inspect the status
  # to glean the is-modified status.
  my $ua = LWP::UserAgent->new;
  my $r = $ua->get($uri);
  if ($r->is_success) {
    my $type = $r->header('Content-Type');
    my $is_binary = $type !~ /^(text|data)\//;
    $self->_log("FTP: type=$type is_binary=$is_binary out=$out_path");
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
  my $root = $$self{config}{local_root} || '/';
  my $addr = addr_normalize("$root/$path");
  if (my $file = $$Hub{$addr}) {
    dir_create($dir);
    file_copy($file->get_path, $out_path);
    return $out_path;
  }
  undef;
}

sub _is_binary_ext {
  my $self = shift;
  my $path = shift;
  return $path =~ /\.(jpe?g|gif|png|pdf|docx?)$/i ? 1 : 0;
  # and so many more...
}

sub _list_recursive {
  my $self = shift;
  my $ftp = shift;
  my $cwd = shift or $self->_die('No working directory specified');
  my $result = shift || Data::OrderedHash->new();
  $cwd .= '/' unless $cwd =~ /\/$/;
  $cwd =~ s/\/$//;
  $ftp->cwd($cwd) or $self->_die($ftp->message . ' cwd="' . $cwd . '"');
  my $entries = $ftp->dir_hashref();
  delete $entries->{'.'};
  delete $entries->{'..'};
  foreach my $k (sort keys %$entries) {
    my $props = $$entries{$k};
#warn hf_format($props, -indent_level => 2);
    $$props{name} = $props->{path};
    my $path = $$props{path} = $cwd . '/' . $props->{path};
    if ($props->{perms} =~ /^d/) {
      $self->_list_recursive($ftp, $path, $result);
    } else {
      $$result{$self->_rpath_to_addr($path)} = $props;
    }
  }
  $result;
}

sub _connect {
  my $self = shift;
  my $conn = $$self{config}{host};
  my ($host, $port) = split ':', $conn;
  my $username = $$self{config}{username};
  my $password = $$self{config}{password};
  my $ftp = Net::FTP->new($host, KeepFirstLine => 1, Port => $port || 21)
    or $self->_die("Cannot connect to '$conn': $@");
  $ftp->login($username, $password)
    or $self->_die("Cannot login as '$username': " . $ftp->message);
  $ftp->pretty_dir(0);
  return $ftp;
}

sub _rpath_to_addr {
  my $self = shift;
  my $remote_path = shift or return;
  my $addr = substr $remote_path, length($$self{config}{path});
  $addr =~ s/^\///;
  $addr;
}

sub _addr_to_rpath {
  my $self = shift;
  my $addr = shift or return;
  path_normalize($$self{config}{path} . '/' . $addr);
}

sub _working_dir {
  my $self = shift;
  my $local_root = $$self{config}{local_root} || '/';
  my $dir = $Hub->get($local_root) or $self->_die('Fatal');
  $dir->get_path;
}

sub _tmp_dir {
  my $self = shift;
  my $dirname = shift or $self->_die('Fatal');
  my $tmpdir = $Hub->vivify("/sys/tmp/ext/ftp/$dirname")->save();
  $tmpdir->get_path;
}

sub _bak_dir {
  my $self = shift;
  my $dirname = shift or $self->_die('Fatal');
  my $docroot = $Hub->get('/')->get_path;
  my $home = path_parent($docroot);
  my $bakroot = path_normalize("$home/archive");
  my $namefmt = "$dirname-%03d";
  my $i = 1;
  while ($i < 1000) {
    my $bakdir = sprintf "$bakroot/$namefmt", $i;
    return $bakdir unless -e $bakdir;
    $i++;
  }
  $self->_die('Backup index exceeded');
}

sub _ftp_mode {
  my $self = shift;
  my $ftp = shift or return;
  my $file = shift or return;
  return $ftp->binary if $$self{config}{'text_mode'} eq 'binary';
  if (isa($file, FS('Node'))) {
    if (isa($file, FS('TextFile'))) {
      return $ftp->ascii;
    }
  } elsif ($self->_is_binary_ext($file)) {
    return $ftp->binary;
  }
  $ftp->ascii;
}

sub _log {
  my $self = shift;
  $Hub->get('/sys/log')->info(@_);
}

1;
