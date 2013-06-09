# PerlModule
use strict;
use Perl::Module;

sub tail_log {
  my $path = '/var/log/execd.log';
  my $tail = `tail -100 "$path"` or die 'Could not read log';
  my $result = [];
  for (split /[\n\r]+/, $tail) {
    push @$result, _parse_entry($_);
  }
  $result;
}

sub _parse_entry {
  $_ = shift;
  return {
    message => $_,
    info => [],
  };
}

1;
