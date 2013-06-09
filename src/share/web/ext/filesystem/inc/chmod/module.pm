# PerlModule
use strict;
use Perl::Module;
use Error::Logical;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use IO::Uncompress::Unzip qw($UnzipError);

sub get_file {
  my %params = @_;
  my $file = $Hub->get($params{'addr'});
  throw Error::IllegalParam unless $file && $file->isa(FS('File'));
  my $perms = $params{'perms'} || 'rw';
  throw Error::AccessDenied
    unless $Hub->get('/sys/perms')->is_authorized($file->get_addr, $perms);
  $file;
}

sub get_mode {
  my %params = @_;
  my $file = get_file(%params, perms => 'r');
  my $stat = $file->get_stat;
  my $mode = $stat->mode & 07777;
  return {
    mode => sprintf("%04o", $mode),
    rwx => [
      [$mode & 0400, $mode & 0200, $mode & 0100],
      [$mode & 0040, $mode & 0020, $mode & 0010],
      [$mode & 0004, $mode & 0002, $mode & 0001],
    ]
  };
}

sub set_mode {
  my %params = @_;
  my $file = get_file(%params, perms => 'rw');
  my $mode_str = $params{'mode'} or throw Error::MissingParam 'mode';
  my $mode = oct($mode_str);
  my $r = chmod oct($mode_str), $file->get_path;
  return {
    result => $r
  };
}

1;
