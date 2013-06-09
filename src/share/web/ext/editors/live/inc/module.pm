# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use HTML::Entities qw(encode_entities);

our $NotSpamText=<<__END;
This is a test email which only contains HTML.  This text
is here not only to alert you as such, but to prevent the
internet bouncers from considering this to be spam.
__END

sub sendmail {
  my %params = @_;
  my %message = ();
  foreach my $k (qw(From To CC Subject)) {
    $message{$k} = $params{$k} or next;
  }
  if (my $text = $params{'Body'}) {
    $message{'Body'} = $text;
  }
  if (my $html = $params{'HTML'}) {
    $message{'HTML'} = encode_entities($html, '^\r\n\x20-\x7e');
    $message{'Body'} ||= $NotSpamText;
  }
  $$Hub{'/ext/sendmail/module.pm/send_mail'}->(%message);
  undef;
}

1;

__END__
