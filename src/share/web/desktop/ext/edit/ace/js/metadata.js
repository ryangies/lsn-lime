js.extend('lsn.desktop.ext.edit.ace.metadata', function (js) {

  var _modes = this.modes = [ // [0] is the default
    {
      name: 'ace/mode/text',
      source: null, // ace.js
      types: ['file-text-txt']
    },
    {
      name: 'ace/mode/c',
      source: 'mode-c_cpp.js',
      types: ['file-text-c', 'file-text-cpp', 'file-text-h']
    },
    {
      name: 'ace/mode/coffee',
      source: 'mode-coffee.js',
      types: []
    },
    {
      name: 'ace/mode/css',
      source: 'mode-css.js',
      types: ['file-text-css']
    },
    {
      name: 'ace/mode/doc',
      source: 'mode-doc.js',
      types: ['file-text-md']
    },
    {
      name: 'ace/mode/html',
      source: 'mode-html.js',
      types: ['file-text-ht', 'file-text-htm', 'file-text-html']
    },
    {
      name: 'ace/mode/java',
      source: 'mode-java.js',
      types: ['file-text-java']
    },
    {
      name: 'ace/mode/javascript',
      source: 'mode-javascript.js',
      types: ['file-text-js']
    },
    {
      name: 'ace/mode/php',
      source: 'mode-php.js',
      types: ['file-text-php']
    },
    {
      name: 'ace/mode/python',
      source: 'mode-python.js',
      types: ['file-text-js']
    },
    {
      name: 'ace/mode/ruby',
      source: 'mode-ruby.js',
      types: ['file-text-ruby']
    },
    {
      name: 'ace/mode/xml',
      source: 'mode-xml.js',
      types: ['file-text-xml']
    }
  ];

  this.getModeByType = function (type) {
    for (var i = 0, mode; mode = _modes[i]; i++) {
      if (js.util.grep(type, mode.types)) {
        return mode;
      }
    }
    return _modes[0]; // default
  };

  var _themes = this.themes = [ // [0] is default
    {
      alias: 'clouds',
      name: 'ace/theme/clouds',
      source: 'theme-clouds.js'
    },
    {
      alias: 'clouds_midnight',
      name: 'ace/theme/clouds_midnight',
      source: 'theme-clouds_midnight.js'
    },
    {
      alias: 'cobalt',
      name: 'ace/theme/cobalt',
      source: 'theme-cobalt.js'
    },
    {
      alias: 'dawn',
      name: 'ace/theme/dawn',
      source: 'theme-dawn.js'
    },
    {
      alias: 'eclipse',
      name: 'ace/theme/eclipse',
      source: 'theme-eclipse.js'
    },
    {
      alias: 'idle_fingers',
      name: 'ace/theme/idle_fingers',
      source: 'theme-idle_fingers.js'
    },
    {
      alias: 'kr_theme',
      name: 'ace/theme/kr_theme',
      source: 'theme-kr_theme.js'
    },
    {
      alias: 'mono_industrial',
      name: 'ace/theme/mono_industrial',
      source: 'theme-mono_industrial.js'
    },
    {
      alias: 'monokai',
      name: 'ace/theme/monokai',
      source: 'theme-monokai.js'
    },
    {
      alias: 'pastel_on_dark',
      name: 'ace/theme/pastel_on_dark',
      source: 'theme-pastel_on_dark.js'
    },
    {
      alias: 'twilight',
      name: 'ace/theme/twilight',
      source: 'theme-twilight.js'
    }
  ];

  this.getThemeByAlias = function (alias) {
    for (var i = 0, theme; theme = _themes[i]; i++) {
      if (theme.alias == alias) {
        return theme;
      }
    }
    return _themes[0]; // default
  };

});
