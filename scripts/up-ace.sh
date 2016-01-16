#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source "$LSN_COMMON/functions"
cd $root

dir_ace="/home/ryan/Projects/ace"
dir_ace_out="$dir_ace/build/src"
dir_dest="$root/src/share/web/ext/editors/text/js/ace"

cd $dir_ace
git submodule update --init --recursive

function list_files () {
  find $dir_ace_out -xtype f -not -name \*noconflict\* -not -name \*uncompressed\* -print
}

cp $(list_files) $dir_dest
cp $dir_ace_out/ace-uncompressed.js $dir_dest
