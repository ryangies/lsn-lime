/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  var _defaultParameters = {
    'digits': 2
  };

  _package.InputDecimal = function (params) {
    CInputBase.call(this, _defaultParameters);
    this.overlayParameters(params);
    this.value = this.emptyValue = new Number();
  };

  _package.InputDecimal.prototype = _proto;

  _package.factory.set('decimal', _package.InputDecimal);

  _proto.marshal = function (dataValue) {
    return dataValue.toFixed(this.getParameter('digits'));
  };

  _proto.unmarshal = function (ctrlValue) {
    return new Number(ctrlValue);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Number(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().toFixed(this.getParameter('digits'));
    //return this.getValue().valueOf();
  };

});
