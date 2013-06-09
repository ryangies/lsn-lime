#!/bin/bash

scriptdir=$(readlink -f "$(dirname $(readlink -f $0))")
root=$(readlink -f "$scriptdir/../")
source "$LSN_COMMON/functions"
cd $root

git_repo="https://github.com/einars/js-beautify.git"
dir_proj="/home/ryan/Projects/js-beautify"
dir_dest="$root/src/share/web/ext/share/contrib/js-beautify"

#
# Update sources
#

if [ ! -d "$dir_proj" ]; then
  if ($(ask_yn "Create: $dir_proj")); then
    pdir=$(readlink -f "$dir_proj/../")
    name=$(basename "$dir_proj")
    cd $(readlink -f "$dir_proj/../")
    git clone "$git_repo" "$name"
    cd $dir_proj
  else
    exit 0
  fi
else
  cd $dir_proj
  git submodule update --init --recursive
fi

#
# Copy to project space
#

mkdir -p $dir_dest
cp beautify*.js $dir_dest
