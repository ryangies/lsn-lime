/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputDateTime = function (params) {
    CInputBase.apply(this, [params]);
    this.dateFormat = this.getParameter('dateFormat') || 'm/d/yyyy'; // MUST (or change parseDate)
    this.timeFormat = this.getParameter('timeFormat') || 'h:MM TT';  // MUST (or change parseTime)
    this.invalidValue = new Date(0);
    this.value = this.emptyValue = new Date();
  };

  _package.InputDateTime.prototype = _proto;

  _package.factory.set('datetime', _package.InputDateTime);

  _proto.createElements = function () {
    this.dateElement = this.attach(js.dom.createElement('INPUT.datetime.date', {'type':'text'}));
    this.timeElement = this.attach(js.dom.createElement('INPUT.datetime.time', {'type':'text'}));
    return [this.dateElement, this.timeElement];
  };

  _proto.read = function () {
    var dateStr = js.dom.getValue(this.dateElement);
    var timeStr = js.dom.getValue(this.timeElement);
    this.value = this.unmarshal(dateStr, timeStr);
    return this;
  };

  _proto.getValueText = function () {
    var dateString = this.marshal(this.value, this.dateFormat);
    var timeString = this.marshal(this.value, this.timeFormat);
    return dateString + ' ' + timeString;
  };

  _proto.write = function () {
    // Only write when changed so to preserve focus when tabbing
    var dateString = this.marshal(this.value, this.dateFormat);
    var timeString = this.marshal(this.value, this.timeFormat);
    if (dateString != js.dom.getValue(this.dateElement)) {
      js.dom.setValue(this.dateElement, dateString);
    }
    if (timeString != js.dom.getValue(this.timeElement)) {
      js.dom.setValue(this.timeElement, timeString);
    }
    return this;
  };

  _proto.marshal = function (dataValue, format) {
    try {
      return js.date.format(dataValue, format);
    } catch (ex) {
      js.console.log(ex);
      return js.date.format(this.invalidValue, format);
    }
  };

  _proto.unmarshal = function (dateStr, timeStr) {
    var date = this.parseDate(dateStr);
    var time = this.parseTime(timeStr);
    var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
        time.getHours(), time.getMinutes(), 0, 0);
    return isNaN(datetime) ? this.invalidValue : datetime;
  };

  _proto.parseDate = function (strValue) {
    if (!js.util.defined(strValue)) strValue = '';
    var now = new Date();
    var parts = strValue.match(/(\d+)/g);
    var date;
    if (parts) {
      // Values are interpreted from left to right
      var m = js.util.asInt(parts[0], true) || now.getMonth();
      var d = js.util.asInt(parts[1], true) || now.getDate();
      var y = js.util.asInt(parts[2], true) || now.getFullYear();
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

  _proto.parseTime = function (strValue) {
    if (!js.util.defined(strValue)) strValue = '';
    var time = new Date();
    var ampm = strValue.match(/([ap]m)/i);
    var parts = strValue.match(/(\d+)/g);
    var date;
    if (parts) {
      // Values are interpreted from left to right
      var h = js.util.asInt(parts[0], true) || 0;
      var m = js.util.asInt(parts[1], true) || 0;
      if (ampm && ampm[0].toLowerCase() == 'pm') h += 12;
      time.setHours(h);
      time.setMinutes(m);
    }
    return time;
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
