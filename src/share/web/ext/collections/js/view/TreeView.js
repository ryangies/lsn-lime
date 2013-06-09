/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var CTreeView = js.ext.share.filesystem.view.SelectView;
  var CTreeViewLayer = js.ext.share.filesystem.view.SelectViewLayer;

  /**
   * @class TreeView
   */

  this.TreeView = function (name, tree) {
    CTreeView.apply(this, arguments);
  };

  var _proto = this.TreeView.prototype = js.lang.createMethods(
    CTreeView
  );

  /**
   * @subclass Layer
   */

  _proto.Layer = function (node, name, view) {
    CTreeViewLayer.apply(this, arguments);
  };

  var Layer = _proto.Layer.prototype = js.lang.createMethods(
    CTreeViewLayer
  );

/*
  Layer.onSelect = function () {
    this.walk(function (child) {
      child.setState('inactive');
    });
    this.show();
  };
*/

  Layer.extendUI = function () {
    this.svName = this.node.getName();
    this.svName.tie(this.uiName, ['innerHTML']);
  };

  Layer.onClick = function (event) {
    js.dom.stopEvent(event);
    this.node.setAsCwd();
    this.node.select();
  };

});
