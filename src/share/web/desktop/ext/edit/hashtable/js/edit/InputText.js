js.extend('lsn.hashtable.edit', function (js) {

  var CInputBase = this.InputBase;

  var InputText = js.lang.createMethods(CInputBase);

  this.InputText = function (elem) {
    CInputBase.apply(this, [elem]);
    this.value = this.emptyValue = new String();
  };

  this.InputText.prototype = InputText;

  InputText.deserialize = function (storedValue) {
    this.setValue(js.data.entities.encode(storedValue));
    return this;
  };

  InputText.serialize = function () {
    return js.data.entities.decode(this.getValue());
  };

});
