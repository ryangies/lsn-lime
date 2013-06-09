/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;

  var _proto = js.lang.createMethods(CInputBase);

  _package.InputText = function (params, elem) {
    CInputBase.apply(this, [params, elem]);
    this.value = this.emptyValue = new String();
  };

  _package.InputText.prototype = _proto;

  _package.factory.set('text', _package.InputText);

  _proto.deserialize = function (storedValue) {
    this.setValue(js.data.entities.encode(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return js.data.entities.decode(this.getValue());
  };

});
