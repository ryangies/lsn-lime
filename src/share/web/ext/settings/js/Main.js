js.extend('lsn.ext.settings', function (js) {

  var Proto = js.lang.createMethods();

  this.Main = function () {
    this.createUI();
    this.load();
  };

  this.Main.prototype = Proto;

  Proto.load = function () {
    var req = new js.lsn.Request('[#`./module.pm/list`]');
    req.addEventListener('onSuccess', this.onLoad, this);
    req.submit();
    return this;
  };

  Proto.onLoad = function (req) {
    this.data = req.responseHash.get('body');
    new js.lsn.ext.settings.Extensions(this);
  };

  Proto.createUI = function () {
    this.uiRoot = js.dom.createElement('DIV');
    js.dom.getBody().appendChild(this.uiRoot);
    return this;
  };

  Proto.appendChild = function (elem) {
    js.dom.appendChild(this.uiRoot, elem);
  };

  Proto.getData = function () {
    return this.data;
  };

});
