# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use WWW::Livesite::OutputStream;

sub publish {
  my $diff = prepare();
  upload() if grep_first {$$_{'status'}} values %$diff;
}

sub query {
  my $sync = _create_instance();
  $sync->delete_local(-quiet);
  $sync->query_local();
}

sub export {
  my $sync = _create_instance();
  $sync->delete_local(-quiet);
  $sync->fetch_local();
}

sub prepare {
  my $sync = _create_instance();
  $sync->fetch_remote() unless $sync->is_mirrored();
  $sync->delete_local(-quiet);
  $sync->fetch_local();
  $sync->compare();
}

sub compare {
  my $sync = _create_instance();
  $sync->compare();
}

sub upload {
  my $sync = _create_instance();
  $sync->backup_remote();
  $sync->upload_changes();
}

sub clean {
  my $sync = _create_instance();
  $sync->backup_remote();
  $sync->delete_remote();
  $sync->delete_local();
}

sub download {
  my $sync = _create_instance();
  $sync->backup_working();
  $sync->fetch_remote_into_working();
}

sub get_config {
  my $params = $Hub->get('/sys/request/cgi') || {};
  my $hash = clone($Hub->get('/sys/conf/modules/ftp') || {}, -pure_perl);
  overlay($hash, $params);
  $$hash{path} = path_normalize($$hash{path}) if ($$hash{path});
  $$hash{local_root} = path_normalize($$hash{local_root}) if ($$hash{local_root});
  $hash;
}

sub set_config {
  $Hub->get('/sys/cfgldr')->write_hash('modules/ftp', get_config());
}

# ------------------------------------------------------------------------------

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  1;
}

sub _create_instance {
  $Hub->get('./FTPSync.pm')->{'new'}(
    WWW::Livesite::OutputStream->new(),
    get_config(),
  );
}

1;
