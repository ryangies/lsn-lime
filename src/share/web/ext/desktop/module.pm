# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);

sub get_menu_config {
  my $categories = [];
  my $result = {name => 'Desktop', items => $categories};
  my $entries = get_menu_entries(-all => 1);
  foreach my $entry (@$entries) {
    my $items = [];
    my $category = {
      type => 'category',
      heading => $$entry{'heading'},
      items => $items,
    };
    foreach my $module (@{$$entry{'modules'}}) {
      next unless $$module{'enabled'};
      push @$items, {
        type => 'item',
        text => $$module{'name'},
        tooltip => $$module{'desc'},
        action => 'open-desktop-panel:' . $$module{'src'},
        icon => $$module{'icon'} || '',
      };
    }
    @$items and push @$categories, $category;
  }
  return $result;
}

sub get_menu_entries {
  my $opts = my_opts(\@_, {all => 0});
  my $config = shift || $Hub->get('/sys/conf/modules/desktop');
  my $groups = {};
  foreach my $path (@{$config->{ext_path}}) {
    # Virtual modules are entries whith their own configuration, however
    # point to other implementing modules.
    if (my $virtual_list = $Hub->get("$path/desktop.hf/modules")) {
      $virtual_list->iterate(sub {
        my ($name, $props) = @_;
        my $data = clone($props, -pure_perl);
        my $category = $data->{'category'} || 'custom';
        my $modules = $groups->{$category} ||= [];
        my $uid = "$category:$name";
        return if grep_first {$_->{uid} eq $uid} @$modules;
        my $index = $data->{'index'} || '';
        push @$modules, {
          %$data,
          uid => $uid,
          enabled => is_enabled($config, $uid),
        };
      });
    }
    # Implementing modules
    my $dirs = $Hub->get("$path/{-d}") or next;
    foreach my $dir ($dirs->values) {
      my $desktop_hf = $dir->{'desktop.hf'} or next;
      my $data = clone($desktop_hf, -pure_perl);
      next if $data->{unavailable};
      my $category = $data->{'category'} || 'custom';
      my $modules = $groups->{$category} ||= [];
      my $uid = "$category:" . path_name($dir->get_path);
      next if grep_first {$_->{uid} eq $uid} @$modules; # already defined (overrides)
      my $index = $data->{index} || '';
      push @$modules, {
        %$data,
        src => $dir->get_addr . '/' . $index,
        uid => $uid,
        enabled => is_enabled($config, $uid),
      };
    }
  }
  my $result = [];
  my $categories = $Hub->get('./metadata.hf/categories');
  if ($opts->{all}) {
    my $static = $Hub->get('./metadata.hf/static');
    overlay($groups, $static);
  }
  foreach my $category ($categories->keys) {
    my $modules = $groups->{$category} or next;
    push @$result, {
      heading => $categories->{$category},
      modules => $modules,
    };
  }
  $result;
}

sub get_menu_entries_all {
  get_menu_entries(-all => 1);
}

sub is_enabled {
  my ($config, $uid) = @_;
  my $list = $config->{modules} or return;
  grep_first {$_ eq $uid} @$list;
}

1;
