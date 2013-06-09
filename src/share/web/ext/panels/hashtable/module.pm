# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  1;
}

sub get_config {
  my $cgi = $Hub->get('/sys/request/cgi') or return;
  my $config = {};
  foreach my $k ($cgi->keys) {
    my $addr = $$cgi{$k};
    undef $addr unless addr_normalize($addr) eq $addr;
    $$config{$k} = $addr;
  }
  return $config;
}

1;

__END__
