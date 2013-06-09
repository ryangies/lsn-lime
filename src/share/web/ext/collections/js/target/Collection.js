/** @namespace {#namespace}.target */
js.extend('{#namespace}.target', function (js) {

  var CNodeBase = js.{#namespace}.target.Node;
  var CSelection = js.ext.share.Selection;

  /**
   * @class Collection
   */

  this.Collection = function (storage, schema) {
    CSelection.call(this);
    CNodeBase.call(this);
    this.schema = schema;
    this.load(storage);
  };

  var _proto = this.Collection.prototype = js.lang.createMethods(
    CSelection,
    CNodeBase
  );

  _proto.CNode = js.{#namespace}.target.Item;

  /**
   * @function setDataNode
   */

  _proto.setDataNode = function (dnode) {
    this.unload();
    this.data = dnode;
    this.attachDataListener();
  };

  /**
   * @function getDataNode
   */

  _proto.getDataNode = function () {
    return this.data;
  };

  /**
   * @function getSchema
   */

  _proto.getSchema = function (name) {
    return name ? this.schema.getSchema(name) : this.schema;
  };

  /**
   * @function createNode
   */

  _proto.createNode = function (dnode) {
    var node = new this.CNode(dnode);
    node.addActionListener('onclick', function (action, node) {
      this.dispatchAction('onItemClick', node);
    }, this);
    return node;
  };

  /**
   * @function load
   */

  _proto.load = function (itemsNode) {
    this.setDataNode(itemsNode);
    var items = itemsNode.values();
    for (var i = 0, item; item = items[i]; i++) {
      item.load([this.insertChild, this]);
    }
  };

  /**
   * @function unload
   */

  _proto.unload = function () {
    this.detachDataListener();
    this.removeAllChildren();
    this.data = null;
  };

  /** @function canDisplay */
  _proto.canDisplay = function () {
    return false;
  };

});
