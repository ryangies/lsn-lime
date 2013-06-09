/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var _proto = js.lang.createMethods(CInputBase);

  _package.InputPassword = function (params) {
    CInputBase.apply(this, [params]);
  };

  _package.InputPassword.prototype = _proto;

  _package.factory.set('password', _package.InputPassword);

  _proto.createElements = function () {
    return [this.attach(js.dom.createElement('INPUT.password', {
      'type': 'password'
    }))];
  };

});
