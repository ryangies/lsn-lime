js.extend('lsn.hashtable.edit', function (js) {

  var CInputBase = js.lsn.forms.InputBase;

  this.InputStatic = function () {
    CInputBase.apply(this);
    this.value = this.emptyValue = null;
  };

  var InputStatic = this.InputStatic.prototype = js.lang.createMethods(CInputBase);

  InputStatic.getValue = function () {
    return this.value;
  };

  InputStatic.setValue = function (value) {
    this.value = value;
    return this;
  };

  InputStatic.read = function () {
    return this;
  };

  InputStatic.write = function () {
    return this;
  };

});
