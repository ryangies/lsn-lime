/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;
  var _proto = js.lang.createMethods(CInputBase);
  var _helper = js.ext.share.contrib.codemirror;

  var _defaultParams = {
    'mode': "default",
    'lineNumbers': true,
    'lineWrapping': true,
    'smartIndent': false,
    'electricChars': false,
    'autoClearEmptyLines': true,
    'extraKeys': {
      'Tab': 'indentMore',
      'Shift-Tab': 'indentLess'
    },
    'document': js.document
  };

  _package.InputCode = function (params, elem) {
    CInputBase.apply(this, [_defaultParams, elem]);
    this.overlayParameters(params);
    this.value = this.emptyValue = new String();
    this.changeCount = 0;
  };

  _package.InputCode.prototype = _proto;

  _package.factory.set('code', _package.InputCode);

  _proto.createElements = function () {
    var onLoad = js.lang.createCallback(function (wrapper) {
      this.uiWrapper = wrapper;
    }, this);
    var onChange = js.lang.createCallback(function () {
      this.changeCount++;
    }, this);
    var onBlur = js.lang.createCallback(function () {
      if (this.changeCount > 0) {
        try {
          this.executeClassAction('onChange', this);
        } finally {
          this.changeCount = 0;
        }
      }
    }, this);
    this.editor = CodeMirror(onLoad, this.getParameters());
    this.editor.setOption('onChange', onChange);
    this.editor.setOption('onBlur', onBlur);
    if (this.getParameter('mode')) {
      _helper.loadMode(this.getParameter('mode'), this.editor);
    }
    if (this.getParameter('theme')) {
      _helper.loadTheme(this.getParameter('theme'), this.editor);
    }
    return [this.uiWrapper];
  };

  _proto.deserialize = function (storedValue) {
    // TODO Only encode when doctype is html
    this.setValue(js.data.entities.encode(storedValue));
    return this;
  };

  _proto.serialize = function () {
    // TODO Only decode when doctype is html
    return js.data.entities.decode(this.getValue());
  };

  _proto.read = function () {
    if (this.editor) {
      this.value = this.unmarshal(this.editor.getValue());
    }
    return this;
  };

  _proto.write = function () {
    if (this.editor) {
      this.editor.setValue(this.marshal(this.value));
    }
    return this;
  };

  _proto.focus = function () {
    if (this.editor) {
      this.editor.focus();
      this.editor.refresh();
    }
  };

  _proto.select = function () {
    if (this.editor) {
      this.editor.execCommand('selectAll');
    }
  };

  _proto.setValue = function (value) {
    CInputBase.prototype.setValue.apply(this, arguments);
    this.changeCount = 0;
  };

  _proto.getEditor = function () {
    return this.editor;
  };

});
