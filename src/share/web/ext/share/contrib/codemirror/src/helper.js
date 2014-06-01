/** @namespace ext.share.contrib.codemirror */
js.extend('ext.share.contrib.codemirror', function (js) {

  var _package = this;

  var _mode_by_ext = {};
  _mode_by_ext['txt'] = 'text/plain';
  _mode_by_ext['sh'] = 'shell';
  _mode_by_ext['c'] = 'clike';
  _mode_by_ext['cpp'] = 'clike';
  _mode_by_ext['h'] = 'clike';
  _mode_by_ext['css'] = 'css';
  _mode_by_ext['scss'] = 'css';
  _mode_by_ext['md'] = 'markdown';
  _mode_by_ext['hf'] = 'lsn-hf';
  _mode_by_ext['ht'] = 'lsn-html';
  _mode_by_ext['htm'] = 'lsn-html';
  _mode_by_ext['html'] = 'lsn-html';
  _mode_by_ext['java'] = 'clike';
  _mode_by_ext['js'] = 'javascript';
  _mode_by_ext['json'] = 'javascript';
  _mode_by_ext['php'] = 'php';
  _mode_by_ext['ruby'] = 'ruby';
  _mode_by_ext['rb'] = 'ruby';
  _mode_by_ext['erb'] = 'ruby';
  _mode_by_ext['xml'] = 'xml';
  _mode_by_ext['rss'] = 'xml';
  _mode_by_ext['pm'] = 'perl';
  _mode_by_ext['pl'] = 'perl';
  _mode_by_ext['yml'] = 'yaml';
  _mode_by_ext['yaml'] = 'yaml';

  /**
   * _effective_modes - Translate the _mode_by_ext result to the
   * mode which CodeMirror uses. This spagetti is a result off the file
   * which contains the node being different, and need a way to map such
   * that both the file can be included, and the mode can be loaded
   */

  var _effective_modes = {};
  _effective_modes['shell'] = 'text/x-sh';

  var _modes = {};
  {#:for (relpath,f) in "../mode/**/*.js"}
  {#:set addr = '{#:finfo:addr f}'}
  _modes['{#:addr:basename "addr"}'] = "{#relpath}";
  {#:end for}

  var _overlays = {};
  _overlays['lsn-html'] = true;
  _overlays['lsn-hf'] = true;
  _overlays['css'] = true;
  _overlays['js'] = true;
  _overlays['xml'] = true;
  _overlays['rss'] = true;

  var _mode_deps = {};
  _mode_deps['htmlmixed'] = ['xml', 'javascript', 'css'];
  _mode_deps['php'] = ['xml', 'javascript', 'css', 'clike'];
  _mode_deps['lsn-html'] = ['xml', 'javascript', 'css'];

  var _themes = {};
  {#:for (fname,f) in "../theme/*.css"}
  {#:set alias = '{#:substr fname 0, -4}'}
  _themes['{#alias}'] = "[#`../theme/{#fname}`]";
  {#:end for}

  this.getModeByType = function (type, filename) {
    var ext;
    if (type == 'file-data-hash') {
      ext = js.data.addr_ext(filename);
    } else {
      var parts = new String(type).split('-');
      ext = parts.pop();
    }
    var alias = _mode_by_ext[ext] || 'default';
    return alias;
  };

  this.getThemeByAlias = function (alias) {
    return alias;
  };

  this.loadMode = function (alias, editor, cb) {
    var effectiveAlias = this.getEffectiveAlias(alias);
    var id = 'codemirror-mode-' + alias;
    if (!js.dom.include.hasLoaded(id)) {
      var deps = _mode_deps[alias];
      var aliases = deps ? deps.concat([alias]) : [alias];
      var includes = [];
      for (var i = 0, a; a = aliases[i]; i++) {
        var relpath = _modes[a];
        if (!relpath) continue;
        includes.push({
          'id': 'codemirror-mode-' + a,
          'src': "[#`../mode`]/" + relpath
        });
      }
      if (includes.length) {
        js.dom.include.scripts(includes, function () {
          _package.applyMode(editor, alias, effectiveAlias);
          if (cb) js.lang.callback(cb);
        });
      } else {
        if (cb) js.lang.callback(cb);
      }
    } else {
      _package.applyMode(editor, alias, effectiveAlias);
      if (cb) js.lang.callback(cb);
    }
  };

  this.applyMode = function (editor, alias, effectiveAlias) {
    if (effectiveAlias.match(/^bp-/)) {
      _package.applyTemplateOverlay(alias, effectiveAlias);
    }
    if (editor) editor.setOption('mode', effectiveAlias);
  };

  this.loadTheme = function (alias, editor) {
    var id = 'codemirror-theme-' + alias;
    js.dom.include.style({
      'id': id,
      'href': _themes[alias]
    });
    if (editor) editor.setOption('theme', alias);
  };

  this.getEffectiveAlias = function (alias) {
    alias = _effective_modes[alias] || alias;
    return _overlays[alias] ? 'bp-' + alias : alias;
  };

  this.applyTemplateOverlay = function (alias, modeName) {
    CodeMirror.defineMode(modeName, function(config, parserConfig) {
      var strBegin = '[' + '#';
      var chEnd = ']';
      var overlay = {
        token: function(stream, state) {
          if (stream.match(strBegin)) {
            embed = 0;
            while ((ch = stream.next()) != null) {
              if (ch == chEnd) {
                if (embed-- == 0) break;
              }
              if (ch == strBegin[0] && stream.next() == strBegin[1]) {
                embed++;
              }
            }
            return 'keyword';
          }
          while (stream.next() != null && !stream.match(strBegin, false)) {
          }
          return null;
        }
      };
      return CodeMirror.overlayMode(CodeMirror.getMode(config, alias), overlay);
    });
  };

});
