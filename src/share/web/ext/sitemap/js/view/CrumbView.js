js.extend('ext.sitemap.view', function (js) {

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

    this.uiIcon = js.dom.createElement('IMG.icon', {'width':16, 'height':16});
    this.uiName = js.dom.createElement('SPAN.name');

    this.uiAnchor = js.dom.createElement('A',
      {
        'onClick': [this.onClick, this],
        'onMouseOver': [this.onMouseOver, this],
        'onMouseOut': [this.onMouseOut, this]
      },
      [this.uiIcon, this.uiName]
    );

    this.dt = js.dom.createElement('DT', [this.uiAnchor]);
    this.dd = js.dom.createElement('DD');
    this.dl = js.dom.createElement('DL', [this.dt, this.dd]);

    this.svName = this.node.data.getValue('.name');
    this.svName.tie(this.uiName, ['innerHTML']);

    this.updateUI();

  };

  Layer.updateUI = function () {
    var addr = this.node.getTargetAddress();
    js.dom.setAttribute(this.uiAnchor, 'href', addr);
    js.dom.setAttribute(this.uiAnchor, 'title', addr);
    js.dom.setAttribute(this.uiIcon, 'src', this.node.getIconPath());
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
  };

  Layer.onMouseOver = function (event) {
  };

  Layer.onMouseOut = function (event) {
  };

});
