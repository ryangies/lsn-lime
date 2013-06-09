js.extend('ext.editors.text', function (js) {

  env.registerHandler('ext-editors-text-file-save', function (action, editor) {
    editor.store();
    editor.focus();
  });

  env.registerHandler('ext-editors-text-file-reload', function (action, editor) {
    editor.reload();
    editor.focus();
  });

  env.registerHandler('ext-editors-text-file-close', function (action, editor) {
    editor.close();
  });

  var _styleOptions = {};
  
  _styleOptions['html'] = {
    'indent_size': 2,
    'indent_char': ' ',
    'max_char': 100,
    'brace_style': 'expand',
    'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
  };
  
  _styleOptions['css'] = {
    'indent_size': 2,
    'indent_char': ' ',
    'max_char': 100
  };
  
  _styleOptions['js'] = {
    'indent_size': 2,
    'indent_char': ' ',
    'max_char': 100
  };

  env.registerHandler('ext-editors-text-buffer-beautify', function (action, editor) {
    var dnode = editor.getDataNode();
    var type = dnode.getType();
    var buffer = editor.getValue();
    var result = buffer;
    if (/^file-text-ht/.test(type)) {
      result = js.ext.share.contrib.beautifyHTML(buffer, _styleOptions['html']);
    } else if (/^file-text-css$/.test(type)) {
      result = js.ext.share.contrib.beautifyCSS(buffer, _styleOptions['css']);
    } else if (/^file-text-js$/.test(type)) {
      result = js.ext.share.contrib.beautifyJS(buffer, _styleOptions['js']);
    } else {
      env.status.alert('No beautifier available for: ' + type);
      editor.focus();
      return;
    }
    editor.setValue(result);
    editor.focus();
  });

});
