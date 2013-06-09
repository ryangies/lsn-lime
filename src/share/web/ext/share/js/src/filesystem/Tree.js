/** @namespace ext.share.filesystem */
js.extend('ext.share.filesystem', function (js) {

  var CSelection = js.ext.share.Selection;

  /**
   * @class Tree
   */

  var CTree = this.Tree = function (dnode, nodeClass) {
    CSelection.apply(this);
    this.hub = dnode.getDataBridge();
    if (!nodeClass) nodeClass = js.ext.share.filesystem.Node;
    this.rootNode = new nodeClass(dnode, this);
  };

  var _proto = this.Tree.prototype = js.lang.createMethods(
    CSelection
  );

  /**
   * @function expandNodeByAddress
   * @param addr
   * @param cb
   */

  _proto.expandNodeByAddress = function (addr, cb) {
    this.hub.fetch(addr, [function (data) {
      if (!data) {
        // Node does not exist
        if (cb) js.lang.callback(cb, this);
        return;
      }
      var targetNode = this.rootNode.getNodeByAddress(data.getAddress());
      if (targetNode) {
        // Expand this node (and parent nodes)
        var node = targetNode;
        while(node) {
          node.expand();
          node = node.parentNode;
        }
      }
      if (cb) js.lang.callback(cb, this, [targetNode]);
    }, this]);
  };

  _proto.selectCwdByAddress = function (addr, cb) {
    this.expandNodeByAddress(addr, [function (node) {
      if (node) node.setAsCwd();
      if (cb) js.lang.callback(cb, this, [node]);
    }, this]);
  };

  /**
   * @function selectNodeByAddress
   * @param addr
   * @param cb
   */

  _proto.selectNodeByAddress = function (addr, cb) {
    var selected = this.getSelected();
    if (selected) {
      var selectedAddr = selected.data.getAddress();
      if (selectedAddr == addr) return;
    }
    this.clearSelection();
    var paddr = js.data.addr_parent(addr);
    this.expandNodeByAddress(paddr, [function (pnode) {
      if (!pnode) {
        // Node does not exist
        if (cb) js.lang.callback(cb, this);
        return;
      }
      pnode.setAsCwd();
      var node = pnode.getNodeByAddress(addr);
      if (node) node.select();
      if (cb) js.lang.callback(cb, this, [node]);
    }, this]);
  };

  _proto.validateCwd = function () {
    var node = this.getCwd();
    if (!node || node.parentNode) return;
    var addr = node.data.getAddress();
    while (!this.hub.getNodeByAddress(addr)) {
      addr = js.data.addr_parent(addr);
    }
    var node = this.rootNode.getNodeByAddress(addr);
    if (node) node.setAsCwd();
  };

  _proto.unload = function () {
    this.rootNode.removeAllChildren();
  };

});
