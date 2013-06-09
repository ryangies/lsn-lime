js.extend('ext.filesystem.view', function (js) {

  var CTreeView = js.ext.share.filesystem.view.TreeView;
  var CTreeViewLayer = js.ext.share.filesystem.view.TreeViewLayer;

  /**
   * @class CrumbView
   */

  this.CrumbView = function (name, tree) {
    this.div = js.dom.createElement('DIV.' + name);
    CTreeView.apply(this, arguments);
  };

  var CrumbView = this.CrumbView.prototype = js.lang.createMethods(
    CTreeView
  );

  CrumbView.getElements = function () {
    return [this.div];
  };
  
  /**
   * @class CrumbView.Layer
   */

  CrumbView.Layer = function (node, name, view) {
    CTreeViewLayer.apply(this, arguments);
  };

  var Layer = CrumbView.Layer.prototype = js.lang.createMethods(
    CTreeViewLayer
  );

  Layer.createUI = function () {
    this.parentElement = this.parentNode
      ? this.parentNode.dd
      : this.view.div;
    this.dt = js.dom.createElement('DT');
    this.dd = js.dom.createElement('DD');
    this.dl = js.dom.createElement('DL', [this.dt, this.dd]);
    this.updateUI();
  };

  Layer.updateUI = function () {
    var data = this.node.data;
    var addr = data.getAddress();
    var name = this.node.getName();
    js.dom.replaceChildren(this.dt, js.dom.createElements(
      'A', {
        'href': addr,
        'title': addr,
        'onClick': [this.onClick, this],
        'onMouseOver': [this.onMouseOver, this],
        'onMouseOut': [this.onMouseOut, this]
      }, [
        'IMG.icon', {'src': data.getIcon()},
        'SPAN.name=' + name
      ]
    ));
  };

  Layer.removeUI = function () {
    js.dom.removeElement(this.dl);
  };

  Layer.onSelectCwd = function () {
    this.walk(function (child) {
      child.setState('inactive');
    });
    this.show();
  };

  Layer.show = function () {
    this.setState('active');
    js.dom.replaceChildren(this.parentElement, [this.dl]);
    if (this.parentNode) this.parentNode.show();
  };

  Layer.setState = function (state) {
    switch (state) {
      case 'inactive':
        js.dom.addClassName(this.dl, 'inactive');
        js.dom.setOpacity(this.dt, .25);
        break;
      default:
        js.dom.removeClassName(this.dl, 'inactive');
        js.dom.setOpacity(this.dt, 1);
    }
  };

  Layer.onClick = function (event) {
    js.dom.stopEvent(event);
    this.node.setAsCwd();
    this.node.expand();
  };

  Layer.onMouseOver = function (event) {
  };

  Layer.onMouseOut = function (event) {
  };

});
