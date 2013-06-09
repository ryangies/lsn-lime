# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use WWW::Livesite::OutputStream;

sub ACCESS {
  1;
}

sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  bless {
    stream => WWW::Livesite::OutputStream->new(),
  }, $class;
}

sub report {
  my $self = shift;
  my $part = {
    'type' => shift,
    'args' => [@_],
  };
  $$self{stream}->append($part);
}

sub fail {
  my $self = shift;
  $self->report('error', @_);
  throw Error::Programatic @_;
}

1;
