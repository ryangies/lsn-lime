# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(path_is_absolute);
use Apache2::Directive;
use Apache2::ServerUtil;
use Net::Execd::Client qw(execd_submit);

sub get_log_entries {
  my $cmd_id = $Hub->str('/sys/conf/modules/errlog/exec_cmd');
  my $log_text = $cmd_id
    ? execd_submit('localhost', 1723, $cmd_id)
    : _tail_log();
  my $result = [];
  for (split /[\n\r]+/, $log_text) {
    push @$result, _parse_entry($_);
  }
  $result;
}

sub get_logfile_path {
  my $r = $Hub->get('/sys/request/obj');
  my $tree = Apache2::Directive::conftree();
  my $document_root = $r->document_root();
#warn "get-logfile: document_root=$document_root\n";
  my $server_root = Apache2::ServerUtil::server_root();
#warn "get-logfile: server_root=$server_root\n";
  my @errlog_paths = $tree->lookup('ErrorLog'); # wantarray
#  for (@errlog_paths) {
#warn "get-logfile: errlog_paths=$_\n";
#  }
  my $errlog_path = pop(@errlog_paths); # last has prescedence
  my $path = path_is_absolute($errlog_path)
    ? $errlog_path
    : $server_root . '/' . $errlog_path;
}

sub _tail_log {
  my $result = [];
  my $size = shift || 200;
  my $path = get_logfile_path() or return "Could not locate error log";
  # Read [relevant] entries from the log file
  my $c = 0;
  my $last_line = '';
  open LOGFILE, "tac $path 2>/dev/null |" or die;
  while (<LOGFILE>) {
    last if $size ne 'ALL' && $c > $size;
    next if /^ at .*? line \d/;
    next if /Prototype mismatch:/;
    next if /Constant subroutine .* redefined/;
    unshift @$result, $_;
    $c++;
  } continue {
    $last_line = $_;
  }
  close LOGFILE; # breaks the pipe
  join '', @$result;
}

sub _err_entry {
  return {
    message => $_[0],
    info => [
      undef, # date
      $_[1] || 'error', # level
    ],
  };
}

sub _parse_entry {
  $_ = shift;
  my @info = /\[([^\]]+)\]\s+/g;
  s/\[([^\]]+)\]\s+//g;
  s/\\n/\n/g;
  s/\\t/\t/g;
  s/</&lt;/g;
  s/>/&gt;/g;
  push @info, s/, referer: (\S+)$//;
  return {
    message => $_,
    info => \@info,
  };
}

1;
