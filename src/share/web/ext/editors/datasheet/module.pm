# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::OrderedHash;
use Data::Hub::Util qw(:all);

sub list {
  my $result = [];
  $Hub->get('/shop/products/{-d}/{-d}')->iterate(sub {
    my ($p_path, $dir) = @_;
    my $data = $dir->{'index.html'} or return;
    my $path = $data->get_addr;
    my ($name) = path_split($path);
    push @$result, Data::OrderedHash->new(
      name => $name,
      path => $path,
      dir => $p_path,
      %$data
    );
  });
  return $result;
  [sort {$a->{name} cmp $b->{name}} @$result];
}

sub save {
  my ($opts, %params) = my_opts(\@_);
  my $addr = $params{addr};
  my $value = $params{value};
  throw Error::Logical 'Access denied'
    unless $Hub->{'/sys/perms'}->is_session_authorized($addr, 'w');
  $Hub->set($addr, $value);
  $Hub->addr_to_storage($addr)->save();
  'SUCCESS';
}

1;
