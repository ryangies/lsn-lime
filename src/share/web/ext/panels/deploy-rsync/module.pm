# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Hub::FileSystem::Node;
use File::Temp;

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  return unless $u->is_member('sysexec');
  1;
}

sub init_config {
  my $addr = $Hub->get('./desktop.hf/config');
  my $storage = $Hub->get($addr);
  if (!$storage) {
    $storage = $Hub->set($addr, $Hub->get('./config.hf'))->save();
  }
  return $storage;
}

sub _get_config {
  my $uri = $Hub->get('/sys/server/uri');
  my $default_config = {
    base_uri => "http:$uri",
    rsyncopts => "--recursive --times --omit-dir-times --links --delete",
  };
  my $site_config = init_config();
  return overlay($default_config, $site_config, -pure_perl);
}

sub itemize {
  return _rsync('--dry-run');
}

sub diff {
  my %params = @_;
  my $path = $params{'path'};
  return _diff($path);
}

sub deploy {
  return _rsync();
}

sub deploy_items {
  my %params = @_;
  my $trxids = $params{'trxids'};
  return unless isa($trxids, 'ARRAY') && @$trxids;
  my $config = _get_config();
  my $result = undef;
  my $status = itemize();
  my $map = {};
  my $files = [];
  my $deletes = [];
  foreach my $item (@{$$status{'items'}}) {
    $map->{$$item{'trxid'}} = $item;
  }
  foreach my $trxid (@$trxids) {
    my $item = $$map{$trxid} or next;
    if ($$item{'type'} eq 'deleting') {
      push @$deletes, $item;
    } else {
      push @$files, $$item{'path'};
    }
  }
  my $content = join "\n", @$files;
  my $tmpfile = _mktemp($content);
  my $tmppath = $tmpfile->filename;
  $result = _rsync("--files-from=$tmppath");
  if (@$deletes) {
    foreach my $item (@$deletes) {
      my $path = path_join($$config{'dest'}, $$item{'path'});
      die unless index($path, $$config{'dest'}) == 0;
      my $ok = -e $path
        ? -d $path
          ? dir_remove($path)
          : file_remove($path)
        : 1; # does not exist
      $ok and push @{$$result{'files'}}, $item;
    }
  }
  $result;
}

sub _mktemp {
  my $content = shift;
  my $tmpdir = $Hub->get('/sys/tmp')->get_fs_root->get_path;
  my $tmpfile = File::Temp->new(DIR => $tmpdir);
  $tmpfile->unlink_on_destroy(1);
  printf $tmpfile $content;
  return $tmpfile;
}

our %I_TYPES = (
  '<' => 'sent',
  '>' => 'received',
  'c' => 'change/creation',
  'h' => 'hard link',
  '.' => 'na',
);

our %I_FILETYPES = (
  'f' => 'file',
  'd' => 'directory',
  'L' => 'symbolic link',
  'D' => 'device',
  'S' => 'special',
);

our %I_CHANGES = (
  'c' => 'content',
  's' => 'size',
  't' => 'time',
  'T' => 'time',
  'p' => 'permissions',
  'o' => 'owner',
  'g' => 'group',
  'u' => undef, # reserved
  'a' => 'acl',
  'x' => 'attributes',
);

sub _rsync {
  my $options = shift || '';;
  my $stdin = shift;
  my $config = _get_config();
  my $items = [];
  my $excludes_file = _mktemp($$config{'excludes'});
  my $excludes_path = $excludes_file->filename;
  my $cmd = qq(rsync $options --itemize-changes --exclude-from="$excludes_path" $$config{'rsyncopts'} "$$config{'src'}/" "$$config{'dest'}/");
  my $out = `$cmd`;
  foreach my $entry (split /[\r\n]+/, $out) {
    my $change_str = substr $entry, 0, 11;
    my $path = substr $entry, 12;
    my $fullpath = path_join($$config{'src'}, $path);
    my $node = Data::Hub::FileSystem::Node->new($fullpath);
    my $type = substr $change_str, 0, 1;
    my $update = '';
    my $filetype = '';
    my $changed = {};
    if ($type eq '*') {
      $update = substr $change_str, 1;
    } else {
      $update = $I_TYPES{$type};
      $filetype = $I_FILETYPES{substr($change_str, 1, 1)};
      for (grep /[cstTpoguax]/, split(//, substr($change_str, 2))) {
        $$changed{$I_CHANGES{$_}} = 1;
      }
    }
    push @$items, {
      'trxid' => checksum($entry),
      'mtime' => $node->get_mtime,
      'muser' => _get_changed_by($node->get_path) || 'unknown',
      'path' => $path,
      'type' => $type,
      'filetype' => $filetype,
      'nodetype' => $node->get_type,
      'update' => $update,
      'changed' => $changed,
      'cryptic' => $change_str,
    };
  }
  return {
    'output' => $out,
    'items' => $items,
  };
}

sub _diff {
  my $path = shift or return 'No path provided';
  my $config = _get_config();
  my $rpath = path_normalize("$$config{'src'}/$path");
  my $lpath = path_normalize("$$config{'dest'}/$path");
  my $out = `diff "$lpath" "$rpath"`;
  $out || '';
}

sub _get_changed_by {
  my $path = shift;
  my $entries = $Hub->get('/sys/tmp/changelog.yml/entries');
  return $$entries{$path};
}

1;
