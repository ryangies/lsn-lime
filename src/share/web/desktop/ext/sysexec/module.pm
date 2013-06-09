# PerlModule
use strict;
use Error qw(:try);
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Hub::Container;
use WWW::Livesite::OutputStream;

our $Conf_Key = 'custom/sysexec';

sub _get_commands {
  my $config = get_config();
  return split /[\r\n]+/, $$config{'commands'};
# my @result = ();
# push @result, "#You entered: $$config{'example'}";
# push @result, "#Config is stored in sys/conf/$Conf_Key";
# push @result, "#Comments begin with a pound-sign";
# return @result;
}

sub ACCESS {
  my $u = $Hub->get('/sys/user') or return;
  return unless $u->is_member('admins');
  return unless $u->is_member('sysexec');
  1;
}

sub get_config {
  my $params = $Hub->get('/sys/request/cgi') || {};
  my $hash = clone($Hub->get("/sys/conf/modules/$Conf_Key") || {}, -pure_perl);
  overlay($hash, $params);
  $$hash{path} = path_normalize($$hash{path}) if ($$hash{path});
  $$hash{local_root} = path_normalize($$hash{local_root}) if ($$hash{local_root});
  $hash;
}

sub set_config {
  $Hub->get('/sys/cfgldr')->write_hash("modules/$Conf_Key", get_config());
}

sub exec {
  set_config();
  my $stream = WWW::Livesite::OutputStream->new();
  try {
    $stream->append(['status', "Starting"]);
    my $error = _exec($stream);
    $stream->append(['error', $error]) if $error;
  } otherwise {
    $stream->append(['error', '' . $@]);
  } finally {
    $stream->append(['status', "Finished"]);
  };
}

sub _exec {
  my $stream = shift;
  foreach my $command (_get_commands()) {
    if ($command =~ s/^#//) {
      $stream->append(['status', $command]);
      next;
    }
    # TODO Capture STDERR and STDOUT separately.
    # http://docstore.mik.ua/orelly/perl/cookbook/ch16_10.htm
    # * However, what does setting $SIG{CHLD} do to our mod_perl
    #   process?
    if (my $cmd_spec = _expand($command)) {
      open(RESULT, "$cmd_spec 2>&1 |") or die "$!: '$command'\n";
      while (<RESULT>) {
        chomp;
        $stream->append(['result', $_]);
      }
      close RESULT;
    } else {
      $stream->append(['error', 'Invalid command']);
    }
  }
  return;
}

sub _expand {
  my $command = shift or return;
  my @cmd_spec = split /\s/, $command;
  my $cmd_path = shift @cmd_spec or return;

  unless (path_is_absolute($cmd_path)) {
    my $r = $Hub->get('/sys/request/obj');
    my $document_root = $r->document_root();
    my $home_dir = path_parent($document_root); # convention
    return unless -d $home_dir;
    my $rel_path = path_normalize("$home_dir/$cmd_path");
    -e $rel_path and $cmd_path = $rel_path;
  }

  unshift @cmd_spec, $cmd_path;
  return join ' ', @cmd_spec;
}

1;
