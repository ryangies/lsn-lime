/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;

  var _proto = js.lang.createMethods(CInputBase);

  _package.InputArray = function (params, elem) {
    CInputBase.apply(this, [params, elem]);
    this.value = this.emptyValue = new Array();
  };

  _package.InputArray.prototype = _proto;

  _package.factory.set('array', _package.InputArray);

  _proto.createElements = function () {
    this.uiRoot = js.dom.createElement('DIV');
    return [this.uiRoot];
  };

  _proto.read = function () {
    return this;
  };

  _proto.write = function () {
    return this;
  };

  _proto.unmarshal = function () {
    return this.value;
  };

  _proto.marshal = function () {
    return this.value;
  };

  _proto.deserialize = function (storedValue) {
    return this.setValue(storedValue || this.emptyValue);
  };

  _proto.serialize = function () {
    return this.getValue();
  };

});
