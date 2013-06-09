/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputHidden = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = new String();
    this.elements = this.createElements();
  };

  _package.InputHidden.prototype = _proto;

  _package.factory.set('hidden', _package.InputHidden);

  _proto.createElements = function () {
    return [this.attach(js.dom.createElement('INPUT', {'type': 'hidden'}))];
  };

  _proto.isHidden = function () {
    return true;
  };

});
