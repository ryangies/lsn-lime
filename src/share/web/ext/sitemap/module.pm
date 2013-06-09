# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Error::Logical;
use Data::UUID;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::OrderedHash;

our $UG = Data::UUID->new();
our $TYPE_AUTO = 'auto';
our $TYPE_CATEGORY = 'category';
our $TYPE_WEBPAGE = 'webpage';

sub ACCESS {
  my $u = $$Hub{'/sys/user'} or return;
  $u->is_member('admins') or return;
  1;
}

sub get_sitemap {
  my $addr = $Hub->get('/sys/conf/ext/sitemap/addr') || '/web/data/sitemap.hf';
  my $sitemap = $Hub->get($addr) || new_sitemap(addr => $addr);
  return $sitemap;
}

sub get_sitemap_addr {
  get_sitemap()->get_addr;
}

sub new_sitemap {

  my ($opts, %params) = my_opts(\@_);

  my $addr = $params{'addr'} or die;
  my $name = $params{'name'} || 'Website',
  my $type = 'category';
  my $uuid = $UG->to_string($UG->create());

  my $data = new Data::OrderedHash(
    '.name' => $name,
    '.type' => $type,
    '.uuid' => $uuid,
  );

  throw Error::Logical 'Sitemap already exists'
    if $$Hub{$addr} && !$$opts{'force'};

  $Hub->get('/sys/log')->warn('Creating sitemap: ' . $addr);

  my $sitemap = $Hub->set($addr, $data)->save();
  $Hub->set('/sys/conf/ext/sitemap/addr', $addr);
  $Hub->get('/sys/cfgldr')->write_value('ext/sitemap/addr', $addr);
  $Hub->get('/sys/cfgldr')->refresh();

  $sitemap;

}

sub new_category {

  my $params = {@_};

  # Create sitemap entry
  my $info = _create_sitemap_entry($TYPE_CATEGORY, $params);

  # Create target directory
  my $dir = $Hub->vivify($$info{'target_addr'});
  $dir->save;
  my $target_addr = $dir->get_addr;

  return {
    commands => [
      ['fetch', $$info{'index_addr'}],
      ['fetch', $target_addr],
    ]
  };

}

sub update_category {

  my $params = {@_};
  my $sitemap = get_sitemap();
  my @commands = (['fetch', $sitemap->get_addr]);

  my $current_addr = $$params{'addr'};
  my $current_pathname = addr_name($current_addr);

  my $current_entry = _get_sitemap_entry($current_addr);

  # Rename
  my $new_name = $$params{'name'};
  $$current_entry{'.name'} = $new_name;

  # Move
  my $new_pathname = $$params{'pathname'};
  if ($current_pathname ne $new_pathname) {
    my $parent_addr = addr_parent($current_addr);
    my $parent_entry = _get_sitemap_entry($parent_addr);
    my $new_entry_addr = "$parent_addr/$new_pathname";
    my $new_target_addr = _build_target_address($new_entry_addr);
    my $current_target_addr = _build_target_address($current_addr);
    my $parent_target_addr = _build_target_address($parent_addr);
    my $parent_dir = $$Hub{$parent_target_addr} or die "Missing parent dir";
    my $current_dir = $$parent_dir{$current_pathname} or die "Current target missing";
    my $new_dir = $$parent_dir{$new_pathname} and die "New target exists";
    dir_move($current_dir->get_path, $parent_dir->get_path . '/' . $new_pathname);
    $$parent_entry{$new_pathname} = $current_entry;
    delete $$parent_entry{$current_pathname};
    $$current_entry{'.addr'} = $new_target_addr;
    $current_entry->walk(sub {
      my ($key, $entry, $depth, $addr, $struct) = @_;
      return unless isa($entry, 'HASH');
      my $target_addr = _build_target_address("$new_entry_addr/$addr");
      my $old_addr = $$entry{'.addr'};
      $$entry{'.addr'} = $target_addr;
#warn "walk-update: $old_addr = $target_addr\n";
      push @commands, ['fetch', $old_addr];
      push @commands, ['fetch', $target_addr];
    });
  }

  $sitemap->save();

  return {
    commands => [@commands]
  };

}

sub new_entry {

  my $params = {@_};

  # Create sitemap entry
  my $info = _create_sitemap_entry($TYPE_AUTO, $params);

  return {
    commands => [
      ['fetch', $$info{'index_addr'}],
      ['fetch', $$info{'target_addr'}],
    ]
  };

}

sub new_webpage {
  
  my $params = {@_};

  # Skeleton config dictates how to construct the target webpage
  my $skel = $$params{'skel'};
  addr_normalize($skel) eq $skel or throw Error::IllegalParam('skel');
  my $skel_config = $$Hub{"$skel/config.hf"}
    or throw Error::Programatic("Missing $skel/config.hf");

  # Find the skeleton file
  my $skel_file_addr = addr_normalize($skel . '/' . $$skel_config{'file'});
  my $skel_file = $$Hub{$skel_file_addr}
    or throw Error::Programatic('Cannot find skel file');

  # Create sitemap entry
  my $info = _create_sitemap_entry($TYPE_WEBPAGE, $params);
  my $entry = $$info{'entry'};

  # Copy skel file
  my $dir = $$Hub{$$info{'target_dir'}};
  my $pathname = $$info{'pathname'};
  my $target_file = $$dir{$pathname};
  unless ($target_file) {

    $target_file = $dir->{$pathname} = $skel_file;

    # Auto-populate page data elements from named title
    if (my $page = $$target_file{'page'}) {
      $$page{'title'} = $$entry{'.name'};
      $$page{'heading'} = $$entry{'.name'};
    }

    $target_file->save();
  }

  my $target_addr = $target_file->get_addr;

  return {
    commands => [
      ['fetch', $$info{'index_addr'}],
      ['fetch', $target_addr],
    ]
  };

}

sub remove {

  my $params = {@_};
  my $commands = [];

  my $index_addr = $$params{'addr'};
  push @$commands, ['remove', $index_addr];

  if ($$params{'remove-data'}) {
    my $entry = _get_sitemap_entry($index_addr);
    my $target_addr = $$entry{'.addr'};
    push @$commands, ['remove', $target_addr] if $target_addr;
  }

  return {commands => $commands};

}

sub _get_sitemap_entry {

  my $addr = shift;
  my $sitemap = get_sitemap();

  # Sitemap
  index($addr, $sitemap->get_addr) == 0 or throw Error::IllegalParam 'addr' . " $addr";
  my $entry = $$Hub{$addr};
  $$entry{'.addr'} ||= _build_target_address($addr);
  return $entry;

}

sub _create_sitemap_entry {

  my $type = shift;
  my $params = shift;

  # Sitemap
  my $sitemap = get_sitemap();

  # Friendly name
  my $name = $$params{'name'} or throw Error::IllegalParam 'Invalid name';

  # Filesystem node name
  my $pathname = $$params{'pathname'};

  # Parent entry
  my $paddr = addr_normalize($$params{'paddr'}) or throw Error::MissingParam 'paddr';
  index($paddr, $sitemap->get_addr) == 0 or throw Error::IllegalParam 'paddr';
  addr_normalize($paddr) eq $paddr or throw Error::IllegalParam 'paddr';
  my $parent = $$Hub{$paddr};
  $$parent{$pathname} and throw Error::IllegalParam 'Sitemap entry exists';

  # Target properties
  my $target_dir = _build_target_address($paddr);
  my $target_addr = $target_dir . '/' . $pathname;

  # Detect type
  if ($type eq $TYPE_AUTO) {
    my $target = $Hub->get($target_addr)
        or throw Error::Logical 'Resource does not exist';
    $type = isa($target, FS('Directory'))
      ? $TYPE_CATEGORY
      : $TYPE_WEBPAGE;
  }

  # Entry within the index (sitemap.hf)
  my $entry = new Data::OrderedHash(
    '.addr' => $target_addr,
    '.name' => $name,
    '.type' => $type,
    '.uuid' => $UG->to_string($UG->create()),
  );

  # Create the new sitemap entry
  $parent->{$pathname} = $entry;
  $sitemap->save();

  return {
    entry => $entry,
    index_addr => "$paddr/$pathname",
    target_dir => $target_dir || '/',
    target_addr => $target_addr,
    pathname => $pathname,
  };

}

sub _build_target_address {
  my $addr = shift;
  my $sitemap = get_sitemap();
  my $result = Data::Hub::Address->new();
  while ($addr && $addr ne $sitemap->get_addr) {
    $result->unshift(addr_name($addr));
    $addr = addr_parent($addr);
  }
  $result->unshift('');
  return $result->to_string;
}

1;
