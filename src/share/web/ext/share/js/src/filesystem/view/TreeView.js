/** @namespace ext.share.filesystem */
js.extend('ext.share.filesystem.view', function (js) {

  var CParameters = js.impl.Parameters;

  this.TreeView = function (name, tree) {
    CParameters.apply(this);
    this.name = name;
    this.tree = tree;
    tree.rootNode.addLayer(name, this);
  };

  var TreeView = this.TreeView.prototype = js.lang.createMethods(
    CParameters
  );

  TreeView.createLayer = function (node, name) {
    if (node.canDisplay()) return new this.Layer(node, name, this);
  };

  TreeView.getElements = function () {
    return [];
  };

  TreeView.Layer = js.ext.share.filesystem.view.TreeViewLayer;

});
