# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);

sub ACCESS {
  my $u = $$Hub{'/sys/user'} or return;
  return unless $u->is_member('admins');
  1;
}

1;
