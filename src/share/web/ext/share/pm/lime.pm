# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(path_parent);

our $Config;

sub ACCESS {
  undef $Config;
  my $u = $$Hub{'/sys/user'} or return;
# return unless $u->is_member('admins');
  # Per-request initialization
  my $addr = $$Hub{'/sys/request/page/parent'};
  $Config = {
    screens => get_screens(),
    addr => $addr,
  };
  1;
}

sub authorize {
  1; # Calling this method forces ACCESS to be executed
}

sub get_config {
  $Config;
}

sub get_screens {
  my $screens = _get_default_screens();
  my $site_screens = $Hub->get('/sys/conf/ext/lime/screens');
  if ($site_screens) {
    foreach my $addr ($site_screens->values) {
      my $mod = substr $addr, 0, 1;
      next unless $mod eq '+' || $mod eq '-';
      $addr = substr $addr, 1;
      my $i = grep_first_index { $_ eq $addr } @$screens;
      $mod eq '+' && !defined($i) and push @$screens, $addr;
      $mod eq '-' && defined($i) and splice @$screens, $i, 1;
      # Older configs contain a list of screens without the
      # +/- prefix, which prevented us from updating the
      # "standard" list here. Those entries are ignored.
    }
  } else {
    _save_screens([]); # Initialize config
  }
  $screens;
}

sub _get_default_screens {
  my @addrs = qw(
    /ext/desktop/screen.ht
    /ext/sitemap/screen.ht
    /ext/filesystem/screen.ht
    /ext/collections/screen.ht
    /ext/editors/text/screen.ht
    /ext/editors/live/screen.ht
    /ext/editors/hash/screen.ht
  );
  return \@addrs;
}

sub _save_screens {
  my $screens = shift or die;
  my $cfg_loader = $Hub->get('/sys/cfgldr');
  my $cfg_files = $cfg_loader->{nodes};
  my $last_file = $cfg_files->[$#$cfg_files];
  $last_file->set('ext/lime/screens', $screens);
  $last_file->save();
}

1;
