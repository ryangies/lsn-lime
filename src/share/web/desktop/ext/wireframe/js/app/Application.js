js.extend('lsn.ext.wireframe.app', function (js) {

  var CApplication = js.lsn.app.Application;

  this.Application = function () {
    CApplication.apply(this);
    this.root = new js.lsn.ext.wireframe.data.RootNode();
  };

  var Application = this.Application.prototype = js.lang.createMethods(
    CApplication
  );

  Application.commands = {};

  Application.exec = function (cmd, values) {
    var func = this.commands[cmd];
    if (!func) throw 'Unknown command: ' + cmd;
    func.apply(this, [values]);
  };

});
