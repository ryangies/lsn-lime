# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Parse::Template::Web;
use Encode qw(encode);
#use Try::Tiny;
#use HTML::Entities;

use Email::Simple::Creator; # or other Email::
use Email::MIME::Creator; # or other Email::

# Older version used these modules
#use Email::Send;
#use Net::SMTP::SSL;
#use Net::SMTP::TLS;

use Email::Sender::Simple qw(sendmail);
use Email::Sender::Transport::SMTP qw();
use Email::Sender::Transport::SMTP::TLS qw();
use File::Type;

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
#   To => [#name]@example.com
#   Body => Hello [#name], this is a test.
#
# C<$data> is a HASH such as:
#
#   name => Jon
#
# When C<$template> is a file-system node, the parser uses its path as the
# working directory.
# ------------------------------------------------------------------------------

sub send_templated_mail {
  my $self = shift;
  my $template = shift;
  my $data = shift;
  my %params = ();
  my @opts = ();
  if (isa($template, FS('Node'))) {
    my $addr = $template->get_addr;
    my $path = addr_parent($addr);
    my $name = addr_name($addr);
    @opts = (-path => $path, -name => $name);
  }
  foreach my $k (keys %$template) {
    my $v = $template->{$k};
    $params{$k} = $self->parse_value($v, $data, @opts);
  }
  $self->send_mail(%params, @_);
  1;
}

sub parse_value {
  my $self = shift;
  my $str = str_ref(shift);
  my $vars = shift;
  my $out = $$self{'parser'}->compile_text($str, $vars, @_);
# encode_entities($$out, '^\n\x20-\x25\x27-\x7e');
  $$out;
}

# Common charsets: utf-8, iso-8859-1
# 
# my $email = Email::Simple->create(
#   header => [%params],
#   body => $body
# );

sub send_mail {

  my $self = shift;
  my %params = @_;
  my $html = delete $params{'HTML'};
  my $body = delete $params{'Body'};
  my $attachments = delete $params{'Attachments'};
  my $smtp = $$self{'smtp'} or die 'Missing SMTP configuration';
  my $args = $$self{'args'}; # overrides smtp
  my $smtp_config = {%$smtp, %$args};
  my $transport_class = undef;
  my $envelope = {};

  # The `from` value must be in user@name.tld format. When absent the `From` 
  # header is used which is not restricted in format.
  if (my $from = $$smtp_config{'from'}) {
    $$envelope{'from'} = $from;
  }

  # The transport could be Email::Sender::Transport::Sendmail, however we are
  # reading our configuration from a variable called `smtp` after all.
  #
  # We will correct the username and password keys, rather than making each
  # admin dig through documentation.
  if ($$smtp_config{'tls'}) {
    $transport_class = 'Email::Sender::Transport::SMTP::TLS';
    $$smtp_config{'username'} ||= delete $$smtp_config{'sasl_username'};
    $$smtp_config{'password'} ||= delete $$smtp_config{'sasl_password'};
  } else {
    $transport_class = 'Email::Sender::Transport::SMTP';
    $$smtp_config{'sasl_username'} ||= delete $$smtp_config{'username'};
    $$smtp_config{'sasl_password'} ||= delete $$smtp_config{'password'};
  }
  $$envelope{'transport'} = $transport_class->new($smtp_config);

  # Each multipart/alternative (text and html) part goes here
  my $alternatives = [];

  #
  # Text part
  #
  # We use quoted-printable
  # http://www.w3.org/Protocols/rfc1341/5_Content-Transfer-Encoding.html
  # 
  # This is done automatcially by setting the encoding. However explains why
  # we Encode::encode the perl string
  # http://perldoc.perl.org/MIME/QuotedPrint.html
  #
  # Want to check the results
  # http://www.webatic.com/run/convert/qp.php
  #
  # Nothing like a reference table
  # http://www.ic.unicamp.br/~stolfi/EXPORT/www/ISO-8859-1-Encoding.html
  #
  $body = 'This is a multipart message sent in MIME format' if !$body && $html;
  push @$alternatives, Email::MIME->create(
    attributes => {
      content_type => "text/plain",
      encoding => 'quoted-printable',
      charset => "utf-8",
    },
    body => encode('utf8', $body),
  );

  # HTML part
  if ($html) {
    push @$alternatives, Email::MIME->create(
      attributes => {
        content_type => "text/html",
        charset => "utf-8",
      },
      body =>  $html,
    );
  }

  # Each multipart/mixed (top-level) part goes here
  my $parts = [
    Email::MIME->create(
      attributes => {
        'content_type' => 'multipart/alternative',
      },
      parts => $alternatives,
    ),
  ];

  # Attachments are placed at the top (mulitpart/mixed) level
  if ($attachments) {
    foreach my $hash (@$attachments) {
      my $path = $$hash{'path'} or next;
      my $name = $$hash{'name'} || 'missing-file-name';
      my $type = File::Type->mime_type($path);
      my $blob = file_read_binary($path);
#warn "Attaching: $name (from $path) which isa $type\n";
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

  #
  # Headers
  # http://stackoverflow.com/questions/11969775/how-to-encode-mail-subject-in-perl
  # http://en.wikipedia.org/wiki/MIME#Encoded-Word
  #
  foreach my $k (keys %params) {
    if (my $v = $params{$k}) {
      $v = $params{$k} = encode('MIME-Header', $v);
      $$Hub{'/sys/log'}->info("MIME-Header[$k]: $v\n");
    }
  }

  my $email = Email::MIME->create(
    header => [%params, 'Content-Type' => 'multipart/mixed'],
    parts => $parts,
  );

#warn "-" x 10, "\n";
#warn "Mail header: $_ = $params{$_}\n" for (sort keys %params);
#warn "Email: " . $email->as_string;

 sendmail($email, $envelope);

}

1;
