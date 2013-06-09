# PerlModule
use strict;
use GD;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Hub::Container;
use WWW::Livesite::OutputStream;
use WWW::Misc::Image qw(image_dims resize_str_to_props);

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  1;
}

sub get_config {
  my $params = $Hub->get('/sys/request/cgi') || {};
  my $hash = clone($Hub->get('/sys/conf/modules/images') || {}, -pure_perl);
  overlay($hash, $params);
  $$hash{path} = path_normalize($$hash{path}) if ($$hash{path});
  $$hash{local_root} = path_normalize($$hash{local_root}) if ($$hash{local_root});
  $hash;
}

sub set_config {
  $Hub->get('/sys/cfgldr')->write_hash('modules/images', get_config());
}

sub search {
  set_config();
  my $stream = WWW::Livesite::OutputStream->new();
  _search($stream);
}

sub resize {
  set_config();
  my $stream = WWW::Livesite::OutputStream->new();
  my $results = Local::ArrayStream->new();
  _search($results);
  foreach my $part (@$results) {
    _resize($part);
    $$part{'actual_dims'} = $$part{'resize_dims'};
    $stream->append($part);
  }
}

sub _search {
  my $stream = shift;
  my $d = get_cgi_raw('directory') or return;
  my $r = get_cgi_raw('resize') || '';
  my $size = get_cgi_raw('size') || '';
  my $q_size = $size ? resize_str_to_props($size) : undef;
  my $q_filter = get_cgi_raw('filter') || '.';
  if (my $subset = $Hub->get("$d/**/{-f}|{?(=~i):$q_filter}")) {
    $subset->iterate(sub {
      my ($fn, $file) = @_;
      my $type = typeof($fn, $file);
      return unless $type =~ /^file-(gif|jpe?g|png)/;
      my @actual_dims = image_dims($file->get_path);
      if ($q_size) {
        defined $q_size->{'max_x'} and return unless $actual_dims[0] < $q_size->{'max_x'};
        defined $q_size->{'min_x'} and return unless $actual_dims[0] > $q_size->{'min_x'};
        defined $q_size->{'max_y'} and return unless $actual_dims[1] < $q_size->{'max_y'};
        defined $q_size->{'min_y'} and return unless $actual_dims[1] > $q_size->{'min_y'};
      }
      my @resize_dims = $r ? image_dims($file->get_path, -resize => $r) : @actual_dims;
      my $part = {
        type => 'result',
        addr => $file->get_addr,
        resize => $r,
        actual_dims => \@actual_dims,
        resize_dims => \@resize_dims,
      };
      $stream->append($part);
    });
  }
}


sub _resize {
  my $part = shift or return;
  my $addr = $$part{'addr'};
  my $actual = $$part{'actual_dims'};
  my $resize = $$part{'resize_dims'};
  my $file = $Hub->get($addr) or return;
  my $path = $file->get_path;
  my $src = GD::Image->new($path) or die $@;
  my $out = GD::Image->new(@$resize);
  $out->copyResampled($src, 0, 0, 0, 0, @$resize, @$actual);
  my $ext = path_ext($path);
  if ($ext =~ /jpe?g/i) {
    file_write_binary($path, $out->jpeg);
  } elsif ($ext =~ /png/i) {
    file_write_binary($path, $out->png);
  } else {
    throw Error::Programatic "unsupported file type for image resize: $ext";
  }
  $file->reload();
}

sub get_cgi_word {
  my $k = shift;
  my $v = get_cgi_raw($k);
  undef $v unless $v =~ /^[\/\w\d_-]+$/;
  $v;
}

sub get_cgi_raw {
  my $k = shift;
  return unless $k =~ /^[\w\d_-]{1,32}$/;
  $Hub->get("/sys/request/cgi/$k");
}

1;

package Local::ArrayStream;
sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  my $self = bless [], $class;
  $self;
}
sub append {
  my $self = shift;
  push @$self, @_;
}
1;


