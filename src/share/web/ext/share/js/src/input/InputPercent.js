/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  var _defaultParameters = {
    'digits': 0
  };

  _package.InputPercent = function (params, digits) {
    CInputBase.call(this, _defaultParameters);
    this.overlayParameters(params);
    this.value = this.emptyValue = new Number();
  };

  _package.InputPercent.prototype = _proto;

  _package.factory.set('percent', _package.InputPercent);

  _proto.marshal = function (dataValue) {
    var value = new Number(dataValue.valueOf() * 100);
    return value.toFixed(this.getParameter('digits')) + '%';
  };

  _proto.unmarshal = function (ctrlValue) {
    var parts = ctrlValue.match(/^([\+\-\d\.]+)%?$/);
    var value;
    if (parts) {
      var amount = parts[1];
      value = new Number(amount);
    } else {
      value = new Number(ctrlValue);
    }
    return new Number(value / 100);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Number(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().toFixed(this.getParameter('digits') + 2);
  };

});
