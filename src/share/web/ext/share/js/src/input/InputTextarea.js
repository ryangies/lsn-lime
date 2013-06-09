/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputTextarea = function (params, elem) {
    CInputBase.apply(this, [params, elem]);
    this.value = this.emptyValue = new String();
  };

  _package.InputTextarea.prototype = _proto;

  _package.factory.set('textarea', _package.InputTextarea);

  _proto.createElements = function () {
    var textarea = this.attach(js.dom.createElement('TEXTAREA'));
    var handle = js.dom.createElement('DIV#resize-handle', {'innerHTML':'='});
    var resize = new js.ext.share.ui.ResizeElement(textarea, handle);
    resize.setParameter('resize_width', false);
    return js.dom.createElements('DIV#input-textarea', [textarea, handle]);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(js.data.entities.encode(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return js.data.entities.decode(this.getValue());
  };

});
