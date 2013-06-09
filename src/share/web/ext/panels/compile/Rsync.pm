# PerlModule
use strict;
use Perl::Module;
use Error::Programatic;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::OrderedHash;
use Data::Format::Hash qw(hf_format);

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  $u->is_member('admins');
}

sub new {
  my $class = ref($_[0]) ? ref(shift) : shift;
  my $self = bless {
    stream => shift,
    config => shift,
  }, $class;
  $$self{settings} = $$self{config}->get_config;
  $self;
}

sub rsync {
  my $self = shift;
  $self->{stream}->report('status', 'Transfer (rsync)');

  my $local_path = $$self{config}->mktemp('local');
  my $remote_path = $$self{settings}{remote_root} or die "No remote root!";

  my @rsync_command = qw(
    /usr/bin/rsync
    -vv
    --rsh=ssh
    --recursive
    --times
    --omit-dir-times
    --links
    --human-readable
  );
  push @rsync_command, "$local_path/";
  push @rsync_command, "$remote_path/";

  my $cmd_spec = join ' ', @rsync_command;
  $self->{stream}->report('output', $cmd_spec);

  open(RESULT, "$cmd_spec 2>&1 |") or die "rsync: $!\n";
  while (<RESULT>) {
    chomp;
    $self->{stream}->report('output', $_);
  }
  close RESULT;

}

1;
