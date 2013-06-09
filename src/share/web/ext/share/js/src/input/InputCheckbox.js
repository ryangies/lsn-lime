/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputCheckbox = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = new Boolean(false);
    this.uiCheckboxLabel = null;
  };

  _package.InputCheckbox.prototype = _proto;

  _package.factory.set('checkbox', _package.InputCheckbox);

  _proto.createElements = function () {
    var elems = [];
    var id = js.util.randomId('checkbox');
    var checkBox = this.attach(js.dom.createElement('INPUT.checkbox', {
      'id': id,
      'type': 'checkbox'
    }));
    this.uiCheckboxLabel = js.dom.createElement('LABEL', {
      'for': id
    });
    var paramLabel = this.getParameter('label');
    if (paramLabel) {
      js.dom.setValue(this.uiCheckboxLabel, paramLabel);
    }
    return [checkBox, this.uiCheckboxLabel];
  };

  _proto.marshal = function (dataValue) {
    return dataValue.valueOf();
  };

  _proto.unmarshal = function (ctrlValue) {
    var bPrimitive = ctrlValue == 'off'
      ? false
      : ctrlValue
        ? true
        : false;
    return new Boolean(bPrimitive);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Boolean(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf() ? 1 : 0;
  };

});
