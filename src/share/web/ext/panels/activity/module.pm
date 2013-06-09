# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Misc::Time qw(:all);
use Time::Piece;

sub get_active {
  my $result = [];
  foreach my $cred ($$Hub{'/sys/tmp/credentials/*.json'}->values) {
    my $now = Time::Piece->new();
    my $t = Time::Piece->new($$cred{'mtime'});
    my $delta = $now - $t;
    my $delta_dhms = sprintf('(%02d:%02d:%02d) %02d:%02d:%02d', time_ymdhms($delta));
    my $delta_class = $delta < ONE_MINUTE ? 'recent'  :
                      $delta < ONE_DAY    ? 'today'   : '';
    push @$result, {
      delta_seconds => $delta,
      delta_class => $delta_class,
      delta_dhms => $delta_dhms,
      user => $$Hub{'/sys/users/' . $$cred{'un'}},
      cred => $cred,
    };
  }
  return [sort {$$a{delta_seconds} <=> $$b{delta_seconds}} @$result];
}

1;
