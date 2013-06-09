js.extend('lsn.ext.settings', function (js) {

  var CApplication = js.lsn.desktop.Application;

  var Proto = js.lang.createMethods(CApplication);

  this.Main = function () {
    CApplication.call(this);
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
    CApplication.prototype.createUI.call(this);
    js.dom.getBody().appendChild(this.getRootElement());
    return this;
  };

  Proto.appendChild = function (elem) {
    var body = this.getElement('div_body');
    body.appendChild(elem);
  };

  Proto.getData = function () {
    return this.data;
  };

});
