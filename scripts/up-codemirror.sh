#!/bin/bash

scriptdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
root="$( cd "$scriptdir/.." && pwd )"
source "$LSN_COMMON/functions"
cd $root

dir_proj="/home/ryan/Projects/CodeMirror"
dir_dest="$root/src/share/web/ext/share/contrib/codemirror"

#
# Update sources
#

cd $dir_proj
#git fetch upstream
#git submodule update --init --recursive

#git checkout --
git pull

#
# Copy to project space
#

mkdir -p $dir_dest

rsyncopts="--recursive --times --omit-dir-times --links --exclude-from=$scriptdir/rsync-excludes"

dirlist_contrib=(
  lib
  addon
  mode
  theme
)

# Entries are relative to current directory
for subdir in ${dirlist_contrib[@]}; do
  printf "%-20s -> %s\n" "$subdir" "$dir_dest/$subdir/"
  mkdir -p $dir_dest/$subdir
  rsync $rsyncopts $subdir/ $dir_dest/$subdir/
done
