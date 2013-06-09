js.extend('lsn.ext.wireframe.ui', function (js) {

  var CNode = js.lsn.ext.wireframe.data.Node;
  var CAction = js.action.ActionDispatcher;

  this.View = function (app) {
    CAction.apply(this);
    this.app = app;
    this.root = app.root;
    js.action.addActionListener(CNode, 'onAdopt', this.onAdopt, this);
    js.action.addActionListener(CNode, 'onOrphan', this.onOrphan, this);
    app.addActionListener('onPageLoad', this.onPageLoad, this);
    app.addView(this);
  };

  var _proto = this.View.prototype = js.lang.createMethods(
    CAction
  );

  _proto.onPageLoad = function () {
  };

  _proto.onAdopt = function (action, node) {
  };

  _proto.onOrphan = function (action, node) {
  };

});
