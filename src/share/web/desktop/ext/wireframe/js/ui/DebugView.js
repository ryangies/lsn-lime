js.extend('lsn.ext.wireframe.ui', function (js) {

  var CView = js.lsn.ext.wireframe.ui.View;

  this.DebugView = function (app) {
    CView.apply(this, arguments);
  };

  var _proto = this.DebugView.prototype = js.lang.createMethods(
    CView
  );

  _proto.onPageLoad = function () {
    this.uiRoot = js.dom.getElement('DebugView');
  };

  _proto.onAdopt = function (action, node) {
    CView.prototype.onAdopt.apply(this, arguments);
    this.refresh();
  };

  _proto.onOrphan = function (action, node) {
    CView.prototype.onOrphan.apply(this, arguments);
    this.refresh();
  };

  _proto.refresh = function () {
    var str = '';
    this.root.walk(function (node) {
      for (var i = 1; i < node.getDepth(); i++) {
        str += '  ';
      }
      str += node.toString() + "\n";
    });
    js.dom.setValue(this.uiRoot, str);
  };

});
