/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  var _defaultParameters = {
    'digits': 2
  };

  _package.InputCurrency = function (params, digits) {
    CInputBase.call(this, _defaultParameters);
    this.overlayParameters(params);
    this.value = this.emptyValue = new Number();
  };

  _package.InputCurrency.prototype = _proto;

  _package.factory.set('currency', _package.InputCurrency);

  _proto.marshal = function (dataValue) {
    return '$' + dataValue.toFixed(this.getParameter('digits'));
  };

  _proto.unmarshal = function (ctrlValue) {
    var parts = ctrlValue.match(/^([^\.\d+-])?\s*(.*?)\s*([A-Z]{2,3})?$/);
    if (parts) {
      var symbol = parts[1];
      var amount = parts[2];
      var code = parts[3];
      return new Number(amount);
    } else {
      return new Number(ctrlValue);
    }
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
