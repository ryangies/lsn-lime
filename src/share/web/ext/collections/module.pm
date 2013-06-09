# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);

sub ACCESS {
  my $u = $$Hub{'/sys/user'} or return;
  $u->is_member('admins') or return;
  1;
}

sub get_collections {
  my $addr = get_collections_addr();
  my $collections = $Hub->get($addr) || {};
  return $collections;
}

sub get_collections_addr {
  $Hub->get('/sys/conf/ext/collections/addr') || '/web/data/site.hf/collections';
}

1;
