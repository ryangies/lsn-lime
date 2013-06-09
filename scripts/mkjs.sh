#!/bin/bash

root=$(readlink -f "$(dirname $(readlink -f $0))/../")
source "$LSN_COMMON/functions"
cd $root

proc=$(ps -fC lsn-jsc)
if [ "$?" == "0" ]; then
  echo $proc
  if (! ask_yn 'Run anyway?'); then
    exit 0;
  fi
fi

build_files=(

  src/share/web/ext/share/contrib/codemirror/build.hf
  src/share/web/ext/share/contrib/js-beautify/build.hf

  src/share/web/ext/desktop/js/build.hf
  src/share/web/ext/filesystem/js/build.hf
  src/share/web/ext/sitemap/js/build.hf
  src/share/web/ext/collections/build.hf
  src/share/web/ext/share/js/common.hf
  src/share/web/ext/share/js/ext-share.hf
  src/share/web/ext/editors/text/js/build.hf
  src/share/web/ext/editors/hash/build.hf
  src/share/web/ext/editors/live/js/build.hf
  src/share/web/ext/editors/live/js/build-dde.hf
  src/share/web/ext/settings/build.hf
  src/share/web/ext/panels/compile/build.hf
  src/share/web/ext/panels/hashtable/js/build.hf

  src/share/web/desktop/js/build.hf
  src/share/web/desktop/ext/settings/build.hf
  src/share/web/desktop/ext/svn/build.hf
  src/share/web/desktop/ext/ftp/js/build.hf
  src/share/web/desktop/ext/images/js/build.hf
  src/share/web/desktop/ext/wireframe/js/build.hf
  src/share/web/desktop/ext/svn/js/build.hf
  src/share/web/desktop/ext/sysexec/js/build.hf
  src/share/web/desktop/ext/edit/data/js/build.hf
  src/share/web/desktop/ext/edit/ace/js/build.hf
  src/share/web/desktop/ext/edit/hashtable/js/build.hf
)

lsn-jsc ${build_files[@]} $@
#vim ${build_files[@]} $@

#
# For debugging, this prompts (pauses) before building each file
#
# for file in ${build_files[@]}; do
#   if (ask_yn "Build $file?"); then
#     lsn-jsc $file $@
#   fi
# done
#
