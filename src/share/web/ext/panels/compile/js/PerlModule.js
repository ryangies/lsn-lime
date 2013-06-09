js.extend('local', function (js) {

  var CPerlModule = js.http.PerlModule;

  this.PerlModule = function () {
    CPerlModule.call(this, '[#`./module.pm`]');
    this.mask = new js.lsn.Mask();
    this.mask.getElement().appendChild(js.dom.createElement(
      'h1=Working...', {'style':{'margin':'5em'}}
    ));
  };

  var _proto = this.PerlModule.prototype = js.lang.createMethods(CPerlModule);

  _proto.onSend = function (req) {
    this.mask.show();
  };

  _proto.onRecv = function (req) {
    this.mask.hide();
  };

});
