# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Apache2::Directive;
use Apache2::ServerUtil;
use Data::Format::Hash qw(hf_format);
use English '-no_match_vars';

sub sysinfo {

  my $result = Data::OrderedHash->new();
  my $r = $Hub->get('/sys/request/obj');
  my $tree = Apache2::Directive::conftree();

  $result->{uid} = $UID;
  $result->{euid} = $EUID;
  $result->{gid} = $GID;
  $result->{egid} = $EGID;

  $result->{document_root} = $r->document_root();
  $result->{server_root} = Apache2::ServerUtil::server_root();
  $result->{sys} = {
    ENV => $$Hub{'/sys/ENV'},
    request => $$Hub{'/sys/request'},
    server => $$Hub{'/sys/server'},
    sid_keysrc => $$Hub{'/sys/sid_keysrc'},
  };

# $result->{'cookies'} = {};
# my $jar = $$Hub{'/sys/request/cookies'};
# foreach my $key (keys %$jar) {
#   my $cookie = $$jar{$key};
#   $result->{'cookies'}{$key} = $cookie->as_string;
# }

  return hf_format($result);

}

1;
