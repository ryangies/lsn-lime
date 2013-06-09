/** @namespace ext.share.input */
js.extend('web.admin.input', function (js) {

  var _package = this;
  var CInputBase = js.ext.share.input.InputBase;

  _package.InputLatLng = function (params) {
    CInputBase.apply(this, [params]);
    this.emptyValue = [0, 0];
    this.value = [0, 0];
  };

  var _proto = _package.InputLatLng.prototype = 
      js.lang.createMethods(CInputBase);

  js.ext.share.input.factory.set('latlng', _package.InputLatLng);

  _proto.createElements = function () {
    this.latElement = this.attach(js.dom.createElement(
      'INPUT.latlng.lat', {'type':'text'}
    ));
    this.lngElement = this.attach(js.dom.createElement(
      'INPUT.latlng.lng', {'type':'text'}
    ));
    return [this.latElement, this.lngElement];
  };

  _proto.getValueText = function () {
    return this.serialize();
  };

  _proto.read = function () {
    var latStr = js.dom.getValue(this.latElement);
    var lngStr = js.dom.getValue(this.lngElement);
    this.value[0] = this.unmarshal(latStr);
    this.value[1] = this.unmarshal(lngStr);
    return this;
  };

  _proto.write = function () {
    // Only write when changed so to preserve focus when tabbing
    var latStr = this.marshal(this.value[0]);
    var lngStr = this.marshal(this.value[1]);
    if (latStr != js.dom.getValue(this.latElement)) {
      js.dom.setValue(this.latElement, latStr);
    }
    if (lngStr != js.dom.getValue(this.lngElement)) {
      js.dom.setValue(this.lngElement, lngStr);
    }
    return this;
  };

  _proto.marshal = function (dataValue) {
    return dataValue.toFixed(6);
  };

  /**
   * @function unmarshal - Convert user input to internal value (decimal degrees)
   *
   * User input             Status
   * ---------------------  ---------
   * 48.860000              Supported
   * 48:51:36 N             Supported
   * 48:51:36.00 N          Supported
   * N 48° 51' 36.00"       TODO
   */

  _proto.unmarshal = function (strValue) {
    if (!js.util.defined(strValue)) strValue = '';
    var value = NaN;
    var dmsFields = strValue.match(/(\d+)\D(\d+)\D([\d\.]+)\s*([NSEW])/i);
    if (dmsFields) {
      var deg = dmsFields[1];
      var min = dmsFields[2];
      var sec = dmsFields[3];
      var hem = dmsFields[4].match(/[NE]/i) ? 1 : -1;
      var dec = (deg * 1) + (min / 60) + (sec / 3600);
      value = new Number(dec * hem);
    } else {
      value = parseFloat(strValue);
    }
    return isNaN(value) ? 0 : value;
  };

  _proto.deserialize = function (storedValue) {
    var latlng = storedValue.split(',');
    var lat = parseFloat(latlng[0]);
    var lng = parseFloat(latlng[1]);
    if (isNaN(lat)) lat = this.emptyValue[0];
    if (isNaN(lng)) lng = this.emptyValue[1];
    this.setValue([lat, lng]);
    return this;
  };

  _proto.serialize = function () {
    var result = this.serializeValue(this.getValue());
    var empty  = this.serializeValue(this.emptyValue);
    return result == empty ? '' : result;
  };

  _proto.serializeValue = function (value) {
    var latStr = value[0].toFixed(6);
    var lngStr = value[1].toFixed(6);
    return latStr + ',' + lngStr;
  };

  _proto.setValue = function (value) {
    if ( !js.util.isArray(value) ) {
      value = js.util.clone(this.emptyValue);
    }
    return CInputBase.prototype.setValue.call(this, value);
  };

});
