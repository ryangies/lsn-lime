/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputBoolean = function (params) {
    CInputBase.apply(this, [params]);
    var paramValue = this.getParameter('value');
    this.value = this.emptyValue = new Boolean(paramValue ? paramValue : 0);
  };

  _package.InputBoolean.prototype = _proto;

  _package.factory.set('bool', _package.InputBoolean);
  _package.factory.set('yesno', _package.InputBoolean);
  _package.factory.set('onoff', _package.InputBoolean);

  _proto.createElements = function () {
    var select = this.attach(js.dom.createElement('SELECT'));
    var displayTexts = this.getBooleanText();
    return js.dom.createElements(select, [
      'OPTION=' + displayTexts[1], {'value': 1},
      'OPTION=' + displayTexts[0], {'value': 0}
    ]);
  };

  _proto.getBooleanText = function (dataValue) {
    var strTrue, strFalse;
    switch (this.getParameter('type')) {
      case 'yesno':
        strTrue = 'Yes';
        strFalse = 'No';
        break;
      case 'onoff':
        strTrue = 'On';
        strFalse = 'Off';
        break;
      case 'bool':
      default:
        strTrue = 'True';
        strFalse = 'False';
    }
    return dataValue
      ? dataValue.valueOf() ? strTrue : strFalse
      : [strFalse, strTrue];
  };

  _proto.getValueText = function () {
    return this.getBooleanText(this.value);
  };

  _proto.marshal = function (dataValue) {
    try {
      return dataValue.valueOf() ? 1 : 0;
    } catch (ex) {
      js.console.log(ex);
      return 0;
    }
  };

  _proto.unmarshal = function (ctrlValue) {
    return new Boolean(js.util.asInt(ctrlValue));
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Boolean(js.util.asInt(storedValue)));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf() ? '1' : '0';
  };

});
