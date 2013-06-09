/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputDate = function (params) {
    CInputBase.apply(this, [params]);
    this.format = this.getParameter('format') || 'm/d/yyyy';
    this.invalidValue = new Date(0);
    this.value = this.emptyValue = new Date();
  };

  _package.InputDate.prototype = _proto;

  _package.factory.set('date', _package.InputDate);

  _proto.marshal = function (dataValue) {
    try {
      return js.date.format(dataValue, this.format);
    } catch (ex) {
      js.console.log(ex);
      return js.date.format(this.invalidValue, this.format);
    }
  };

  _proto.unmarshal = function (ctrlValue) {
    if (!js.util.defined(ctrlValue)) ctrlValue = '';
    var now = new Date();
    var parts = ctrlValue.match(/(\d+)/g);
    var date;
    if (parts) {
      var m = parts[0] || now.getMonth();
      var d = parts[1] || now.getDate();
      var y = parts[2] || now.getFullYear();
      var yyyy;
      y = js.util.pad(new String(y), 2);
      var len = 4 - y.length;
      if (len < 0) yyyy = y.substr(0, 4);
      if (len == 0) yyyy = y;
      if (len > 0) {
        var prefix = new String(now.getFullYear()).substr(0, len);
        yyyy = prefix + y;
      }
      m = m - 1;
      return new Date(yyyy, m, d);
    } else {
      return now;
    }
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Date(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().toUTCString();
  };

  _proto.setValue = function (value) {
    if ( Object.prototype.toString.call(value) === "[object Date]" ) {
      if ( isNaN( value.getTime() ) ) {
        value = this.invalidValue;
      }
    } else {
      value = this.emptyValue;
    }
    return CInputBase.prototype.setValue.call(this, value);
  };

});
