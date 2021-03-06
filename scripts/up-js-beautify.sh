#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
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
    pdir=$(dir_absolute "$dir_proj/../")
    name=$(basename "$dir_proj")
    cd $pdir
    git clone "$git_repo" "$name"
    cd $dir_proj
  else
    exit 0
  fi
else
  cd $dir_proj
  #git submodule update --init --recursive
  git pull
fi

#
# Copy to project space
#

mkdir -p $dir_dest
cp -v js/lib/beautify*.js $dir_dest
