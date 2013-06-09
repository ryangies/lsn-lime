js.extend('lsn.hashtable.view', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.View = function (app) {
    CAction.apply(this);
    this.app = app;
  };

  var View = this.View.prototype = js.lang.createMethods(CAction);

  View.attach = function () {
  };

  View.detach = function () {
  };

});
