js.extend('lsn.ext.svn.view', function (js) {

  this.View = function (app) {
    this.app = app;
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.disableControls = function () {
    this.ctrls = js.dom.getElementsByTagName(js.dom.getBody(),
      ['INPUT', 'SELECT', 'BUTTON']);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      js.dom.setAttribute(ctrl, 'disabled', 'disabled');
    }
  };

  _proto.enableControls = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      js.dom.removeAttribute(ctrl, 'disabled');
    }
  };

});

