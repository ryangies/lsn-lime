# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);

our $Conf_Key = 'smtp';
our $Mailer_PM = $Hub->get('./Mailer.pm');
our $Mailer;

sub ACCESS {
  $Mailer = $$Mailer_PM{'new'}(smtp => get_config());
  1;
}

sub get_config {
  my $hash = $Hub->get("/sys/conf/modules/$Conf_Key") or die 'Missing SMTP configuration';
  my $smtp = clone($hash, -pure_perl);
#warn 'SMTP: ', Dumper($smtp);
  $smtp;
}

sub send_templated_mail {
  $Mailer->send_templated_mail(@_);
}

sub send_mail {
  $Mailer->send_mail(@_);
}

1;

__END__
