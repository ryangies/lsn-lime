js.extend('lsn.ext.wireframe.ui', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.EditView = function (app) {
    CAction.apply(this);
    this.app = app;
    this.app.addActionListener('onPageLoad', this.onPageLoad, this);
    this.app.addActionListener('onSelectNode', this.onSelect, this);
    this.app.addActionListener('onDeselectNode', this.onDeselect, this);
    this.app.addView(this);
  };

  var _proto = this.EditView.prototype = js.lang.createMethods(
    CAction
  );

  _proto.onPageLoad = function () {
    this.uiRoot = js.dom.getElement('EditView');
  };

  _proto.onSelect = function (action, node) {
    var msg = 'Edit this element: ' + node.id;
    js.dom.setValue(this.uiRoot, msg);
  };

  _proto.onDeselect = function (action, node) {
    js.dom.removeChildren(this.uiRoot);
  };

});
