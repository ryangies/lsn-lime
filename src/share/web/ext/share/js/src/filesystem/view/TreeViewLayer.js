/** @namespace ext.share.filesystem */
js.extend('ext.share.filesystem.view', function (js) {

  var CNodeLayer = js.data.NodeLayer;

  this.TreeViewLayer = function (node, name, view) {
    this.view = view;
    CNodeLayer.apply(this, arguments);
    this.node.addActionListener('onExpand', this.onExpand, this);
    this.node.addActionListener('onCollapse', this.onCollapse, this);
    this.node.addActionListener('onSelect', this.onSelect, this);
    this.node.addActionListener('onSelectCwd', this.onSelectCwd, this);
    this.node.addActionListener('onDeselect', this.onDeselect, this);
    this.node.addActionListener('onDeselectCwd', this.onDeselectCwd, this);
    this.node.addActionListener('onUpdate', this.onUpdate, this);
    this.node.addActionListener('onStatus', this.onStatus, this);
    this.events = [];
    this.createUI();
  };

  var TreeViewLayer = this.TreeViewLayer.prototype = js.lang.createMethods(
    CNodeLayer
  );

  TreeViewLayer.onOrphaned = function () {
    CNodeLayer.prototype.onOrphaned.apply(this, arguments);
    this.removeUI();
  };

  TreeViewLayer.createUI = function () {
    this.extendUI();
    this.updateUI();
  };

  TreeViewLayer.extendUI = function () {
  };

  TreeViewLayer.updateUI = function () {
  };

  TreeViewLayer.insertUI = function () {
  };

  TreeViewLayer.removeUI = function () {
  };

  TreeViewLayer.onExpand = function (action, node) {
  };

  TreeViewLayer.onCollapse = function (action, node) {
  };

  TreeViewLayer.onSelect = function (action, node) {
  };

  TreeViewLayer.onDeselect = function (action, node) {
  };

  TreeViewLayer.onSelectCwd = function (action, node) {
  };

  TreeViewLayer.onDeselectCwd = function (action, node) {
  };

  TreeViewLayer.onUpdate = function (action, node) {
    this.updateUI(action.updated);
  };

  TreeViewLayer.onAdopted = function () {
    CNodeLayer.prototype.onAdopted.call(this);
    this.insertUI();
  };

  TreeViewLayer.onReordered = function () {
    CNodeLayer.prototype.onReordered.call(this);
    this.insertUI();
  };

  TreeViewLayer.onStatus = function (action, node, stats) {
  };

});
