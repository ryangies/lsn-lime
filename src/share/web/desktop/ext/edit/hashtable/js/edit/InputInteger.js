/** @namespace lsn.forms */
ECMAScript.Extend('lsn.hashtable.edit', function (ecma) {

  var CInputBase = js.lsn.forms.InputBase;

  var _proto = ecma.lang.createMethods(CInputBase);

  this.InputInteger = function (elem) {
    CInputBase.apply(this, [elem]);
    this.value = this.emptyValue = new Number();
  };

  this.InputInteger.prototype = _proto;

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
