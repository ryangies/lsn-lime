# PerlModule
use strict;
use Perl::Module;
use Email::Simple::Creator; # or other Email::
use Email::MIME::Creator; # or other Email::
#use HTML::Entities;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Parse::Template::Web;
use File::Type;

#use Email::Send;
#use Net::SMTP::SSL;
#use Net::SMTP::TLS;

use Email::Sender::Simple qw(sendmail);
use Email::Sender::Transport::SMTP qw();
use Try::Tiny;

# ------------------------------------------------------------------------------
# new - Create a new Mailer object
# new %params
#
# %params
#
#   smtp    => \%smtp   Hash of mailer_args
#
# optional parameters
#
#   parser  => $parser
#   args    => \%args (see also L</set_arg>)
#
# ------------------------------------------------------------------------------

sub new {
  my $class = ref $_[0] ? ref shift : shift;
  my @members = (
    smtp => {},
    args => {},
    parser => Parse::Template::Web->new($Hub),
    @_
  );
  my $self = bless {@members}, $class;
  $self;
}

sub set_arg {
  my $self = shift;
  my $k = shift;
  my $v = shift;
  $self->{'args'}{$k} = $v;
}

# ------------------------------------------------------------------------------
# send_templated_mail - Create and send message from template
# send_templated_mail $template, $data
#
# C<$template> is a HASH with keys such as:
#
#   From => user@example.com
#   To => user@example.com
#   Body => Hello [#name], this is a test.
#
# C<$data> is a HASH such as:
#
#   name => Jon
#
# ------------------------------------------------------------------------------

sub send_templated_mail {
  my $self = shift;
  my $template = shift;
  my $data = shift;
  my %params = ();
  foreach my $k (keys %$template) {
    my $v = $template->{$k};
    $params{$k} = $self->parse_value($v, $data);
  }
  $self->send_mail(%params, @_);
  1;
}

sub parse_value {
  my $self = shift;
  my $str = str_ref(shift);
  my $vars = shift;
  my $out = $$self{'parser'}->compile_text($str, $vars);
# encode_entities($$out, '^\n\x20-\x25\x27-\x7e');
  $$out;
}

# Common charsets: UTF-8, iso-8859-1
# 
# my $email = Email::Simple->create(
#   header => [%params],
#   body => $body
# );

sub send_mail {
  my $self = shift;
  my %params = @_;
  my $body = delete $params{'Body'};
  my $html = delete $params{'HTML'};
  my $attachments = delete $params{'attachments'};
  my $smtp = $$self{'smtp'} or die 'Missing SMTP configuration';
  my $args = $$self{'args'}; # overrides smtp
  my $smtp_config = {%$smtp, %$args};

  my $envelope = {
   from => $$smtp_config{'from'} || '', # must be in user@name.tld format (uses From header when absent)
   transport => Email::Sender::Transport::SMTP->new($smtp_config),
  };

  my $parts = [];

  # What we can mail are Email::Abstract compatible message objects,
  # e.g. produced by Email::Simple, Email::MIME, Email::Stuff

  if ($body) {
    push @$parts, Email::MIME->create(
      attributes => {
        content_type => "text/plain",
#       disposition => "inline",
        charset => "UTF-8",
      },
      body =>  $body . "\r\n",
    );
  }

  if ($html) {
    push @$parts, Email::MIME->create(
      attributes => {
        content_type => "text/html",
#       disposition => "inline",
        charset => "UTF-8",
      },
      body =>  $html . "\r\n",
    );
  }

  if ($attachments) {
    foreach my $hash (@$attachments) {
      my $path = $$hash{'path'} or next;
      my $name = $$hash{'name'} || 'missing-file-name';
      my $blob = file_read_binary($path);
      my $type = File::Type->mime_type($path);
warn "Attaching: $name (from $path) which isa $type\n";
      push @$parts, Email::MIME->create(
        attributes => {
          'encoding' => 'base64',
          'name' => $name,
          'content_type' => $type,
          'disposition' => "attachment; filename=\"$name\"",
        },
        'body' => $blob,
      );
    }
  }

  my $email = Email::MIME->create(
    header => [%params, 'Content-Type' => 'multipart/alternative'],
    parts => $parts,
  );

 sendmail($email, $envelope);

#warn 'MAILER: ', Dumper($mailer);
#warn 'EMAIL: ', Dumper($email);

}

1;
