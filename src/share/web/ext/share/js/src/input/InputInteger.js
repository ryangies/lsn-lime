/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputInteger = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = new Number();
  };

  _package.InputInteger.prototype = _proto;

  _package.factory.set('integer', _package.InputInteger);

  _proto.marshal = function (dataValue) {
    return dataValue.toFixed();
  };

  _proto.unmarshal = function (ctrlValue) {
    return new Number(ctrlValue);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Number(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf();
  };

});
