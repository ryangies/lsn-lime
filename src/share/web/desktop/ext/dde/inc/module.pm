# PerlModule
use strict;
use Mail::Sender;
use Data::Hub qw($Hub);

our $NotSpamText=<<__END;
This is a test email which only contains HTML.  This text
is here not only to alert you as such, but to prevent the
internet bouncers from considering this to be spam.
__END

sub sendmail {

  my $params = {@_};

  my $connect = $Hub->get('/sys/user/prefs/smtp')
    or throw Error::Logical 'No SMTP preferences found for this user';

	my $preamble = {
    smtp      => $connect->{'server'},
    auth      => $connect->{'auth_type'},
    authid    => $connect->{'auth_user'},
    authpwd   => $connect->{'auth_pass'},
    from      => $connect->{'auth_user'},
    to        => $params->{'mail-to'},
    cc        => $params->{'mail-cc'},
    bcc       => $params->{'mail-bcc'},
    subject   => $params->{'mail-subject'},
    multipart => 'related',
  };

  my $text_msg = $params->{'mail-text'};
  my $html_msg = $params->{'mail-html'};

  if ($html_msg && !$text_msg) {
    $text_msg = $NotSpamText;
  }

  my $mailer = new Mail::Sender;
  $Mail::Sender::NO_X_MAILER = 1;

  eval {
    $mailer->OpenMultipart($preamble)->Part({ctype => 'multipart/alternative'});
    if ($text_msg) {
      $mailer->Part({ctype => 'text/plain', disposition => 'NONE', msg => $text_msg});
    }
    if ($html_msg) {
      $mailer->Part({ctype => 'text/html', disposition => 'NONE', msg => $html_msg});
    }
    $mailer->EndPart("multipart/alternative");
    $mailer->Close();
  } or die $Mail::Sender::Error;

  undef;

}

1;

__END__
