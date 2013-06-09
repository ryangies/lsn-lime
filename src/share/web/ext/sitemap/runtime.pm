# PerlModule
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use Data::Hub::Address;

sub get_sitemap {
  my $sitemap_addr = $Hub->get('/sys/conf/ext/sitemap/addr') || '/web/data/sitemap.hf';
  return $Hub->get($sitemap_addr);
}

# Always return an address to the file being served
sub get_page_addr {
  my $res = $Hub->get('/sys/response/res');
  my $page_addr = $res && can($res, 'get_addr')
    ? new Data::Hub::Address($res->get_addr)
    : new Data::Hub::Address();
  return $page_addr;
}

sub get_sitemap_entry {
  my $sitemap = get_sitemap() or return;
  my $page_addr = get_page_addr() or return;
  my $addr = $page_addr->to_string;
  my $entry = $sitemap->get($addr);
  return $entry;
}

sub get_breadcrumb {
  my $result = [];
  my $sitemap = get_sitemap() or return;
  my $page_addr = get_page_addr() or return;
  my $page_filename = $page_addr->pop();
  $page_addr->push($page_filename) unless $page_filename =~ /(index|overview)\.html$/;
  my $addr = new Data::Hub::Address();
  foreach my $name (@$page_addr) {
    $addr->push($name);
    my $entry = $sitemap->get($addr->to_string) or next;
    push @$result, {
      'href' => $addr->to_string,
      'text' => $$entry{'.name'},
    }
  }
  return $result;
}

sub get_peers {
  my $result = [];
  my $sitemap = get_sitemap() or return;
  my $page_addr = get_page_addr() or return;
  my $page_filename = $page_addr->pop();
  my $category = $sitemap->get($page_addr->to_string || '/') or return;
  foreach my $key ($category->keys) {
    next if $key =~ /^\./;
    next if $key =~ /(index|overview)\.html$/;
    my $entry = $$category{$key} or next;
    my $class = $key eq $page_filename ? 'selected' : '';
    push @$result, {
      'class' => $class,
      'href' => $$entry{'.addr'},
      'text' => $$entry{'.name'},
    }
  }
  return $result;
}

sub get_redirects {
  # Sitemap Redirects
  my @rules = ();
  my $sitemap = get_sitemap() or return;
  foreach my $node ($sitemap->get('/**')->values) {
    if (ref($node) && $$node{'.type'} eq 'webpage') {
      my $addr = $$node{'.addr'};
      if (my $aliases = $Hub->get("$addr//page/aliases")
          || $Hub->get("$addr/index.html/page/aliases")) {
        foreach my $alias (split /[\r\n]+/, $aliases) {
          push @rules, {
            'match' => 0, # Exact
            'ignore_case' => 1,
            'url_path' => $alias,
            'url' => $addr,
            'status' => 301, # Permanent
          };
        }
      }
    }
  }
# my $dest = $Hub->vivify('/web/data/aliases.hf');
# $$dest{'compiled'} = \@rules;
# $dest->save();
  \@rules;
}

1;
