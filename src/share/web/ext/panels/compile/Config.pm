# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);

our $Config;

sub ACCESS {
  undef $Config; # Per-request cached object
  my $u = $Hub->get('/sys/user') or return;
  $u->is_member('admins');
}

sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  my $stream = shift;
  my $conf_key = shift or die "Missing configuration key";
  my $self = bless {
    stream => $stream,
    conf_key => $conf_key,
  }, $class;
  $self;
}

sub get_config {
  my $self = shift or confess 'Missing self';
  return $Config if $Config;
  my $conf_key = $$self{'conf_key'};
  my $params = $Hub->get('/sys/request/cgi') || {};
  my $hash = clone($Hub->get("/sys/conf/modules/$conf_key") || {}, -pure_perl);
  overlay($hash, $params);
  $$hash{path} = path_normalize($$hash{path}) if ($$hash{path});
  $$hash{local_root} = path_normalize($$hash{local_root}) if ($$hash{local_root});
  $Config = $hash;
}

sub set_config {
  my $self = shift or confess 'Missing self';
  my $conf_key = $$self{'conf_key'};
  undef $Config;
  $Hub->get('/sys/cfgldr')->write_hash("modules/$conf_key", $self->get_config());
}

sub get_out_path {
  my $self = shift or confess 'Missing self';
  my $config = $self->get_config;
  my $path = $$config{'local_out_path'};
  if ($path) {
    dir_create($path) unless -d $path;
  } else {
    my $tmpdir = $Hub->vivify('/sys/tmp/ext/compile/out')->save();
    $path = $tmpdir->get_path;
  }
  return $path;
}

sub errlog {
  my $self = shift or confess 'Missing self';
  $Hub->get('/sys/log')->info(@_);
}

1;
