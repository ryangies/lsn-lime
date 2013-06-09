# PerlModule
use strict;
use Perl::Module;
use Error::Logical;
use Data::Hub qw($Hub);
use Data::Hub::Util qw(:all);
use IO::Uncompress::Unzip qw($UnzipError);

sub unzip_list {
# my %params = @_;
# my $zip_file = $Hub->get($params{'zip_addr'});
# my $dest_dir = $Hub->get($params{'dest_addr'});
}

sub unzip {

  my %params = @_;
  my $zip_file = $Hub->get($params{'zip_addr'});
  my $dest_dir = $Hub->get($params{'dest_addr'});

  throw Error::IllegalParam unless $zip_file && $zip_file->isa(FS('Node'));
  throw Error::IllegalParam unless $dest_dir && $dest_dir->isa(FS('Directory'));
  throw Error::AccessDenied
    unless $Hub->get('/sys/perms')->is_authorized($dest_dir->get_addr, 'rw');

  my $dest_path = $dest_dir->get_path;
  my $u = new IO::Uncompress::Unzip $zip_file->get_path
    or throw Error::Logical "Cannot open zip file: $UnzipError";

  my $status;
  for ($status = 1; $status > 0; $status = $u->nextStream()) {

    my $name = $u->getHeaderInfo()->{Name};
    $name =~ s/^[\.\/]+//; # strip relative/absolute path
    my $path = path_normalize("$dest_path/$name");

    warn "Unzip: $name to $path\n" ;

    if (substr($name, -1) eq '/') {

      # Directory entry
      dir_create($path);

    } else {

      my $parent_path = path_parent($path);
      dir_create($parent_path);

      my $h = fs_handle($path, 'w') or throw Error::Logical $!; # LOCK
      binmode $h;
      seek $h, 0, 0;
      truncate $h, 0;
      my $buff;
      while (($status = $u->read($buff)) > 0) {
        print $h $buff;
      }
      close $h;

    }

    last if $status < 0;

  }

  throw Error::Logical "Error processing zip file: $!\n"
      if $status < 0 ;

  return {};

}

1;
