# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use WWW::Livesite::OutputStream;
use Error::Programatic;

our $Conf_Key = 'compile';
our $Stream;
our $Config;

# System
# ------------------------------------------------------------------------------

sub ACCESS {
  $Stream = undef;
  $Config = undef;
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  $Stream = $Hub->get('./Stream.pm')->{'new'}();
  $Config = $Hub->get('./Config.pm')->{'new'}($Stream, $Conf_Key);
  1;
}

# Public
# ------------------------------------------------------------------------------

sub query_local {
  my $compiler = _create_compiler();
  $compiler->query_local();
  $Stream->report('status', 'Finished.');
}

sub compile {
  my $compiler = _create_compiler();
  $compiler->delete_local();
  $compiler->fetch_local($compiler->query_local());
  $Stream->report('status', 'Finished.');
}

sub rsync {
  my $rsync = _create_rsync();
  $rsync->rsync();
  $Stream->report('status', 'Finished.');
}

sub publish {
  my $compiler = _create_compiler();
  $compiler->delete_local();
  $compiler->fetch_local($compiler->query_local());
  my $rsync = _create_rsync();
  $rsync->rsync();
  $Stream->report('status', 'Finished.');
}

sub get_config {
  $Config->get_config(@_);
}

sub set_config {
  $Config->set_config(@_);
}

# Internal
# ------------------------------------------------------------------------------

sub _create_compiler {
  $Hub->get('./SiteCompile.pm')->{'new'}($Stream, $Config);
}

sub _create_rsync {
  $Hub->get('./Rsync.pm')->{'new'}($Stream, $Config);
}

1;
