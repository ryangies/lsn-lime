# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Format::Hash qw(hf_format);

sub _get_default_config {
  clone($Hub->get('./defaults.hf'), -pure_perl);
}

sub _get_desktop_config {
  my $config = $Hub->get('/sys/conf/modules/desktop');
  if (!$config || !$config->{'version'}) {
    $config = _get_default_config();
  }
  $config;
}

sub _save_desktop_config {
  my $config = shift or die 'Missing configuration hash';
  my $cfg_loader = $Hub->get('/sys/cfgldr');
  my $cfg_files = $cfg_loader->{nodes};
  my $last_file = $cfg_files->[$#$cfg_files];
  $last_file->set('modules/desktop', $config);
  $last_file->save();
}

sub _set_extmods {
  my ($values, $config) = @_;
  $values = [$values] unless isa($values, 'ARRAY');
  my $out = $config->{modules} = [];
  for (@$values) {
    next unless /^[0-9a-z_-]+:[0-9a-z_-]+$/i;
    push @$out, $_;
  }
}

sub list {
  my $config = _get_desktop_config();
  my $sub = $Hub->get('../desktop/module.pm/get_menu_entries');
  return {
    menu_entries => &$sub($config),
  };
}

sub save {
  my $cgi = $Hub->get('/sys/request/cgi') || {};
  my $config = _get_desktop_config();
  _set_extmods($cgi->{extmods}, $config);
  _save_desktop_config($config);
  return;
}

1;
