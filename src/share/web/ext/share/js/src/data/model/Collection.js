/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var CNodeBase = js.ext.share.data.model.Node;
  var CSelection = js.ext.share.Selection;

  /**
   * @class Collection
   */

  this.Collection = function (storage, schema) {
    CSelection.call(this);
    CNodeBase.call(this);
    this.schema = schema;
    this.definition = schema.definition;
    this.load(storage);
  };

  var _proto = this.Collection.prototype = js.lang.createMethods(
    CSelection,
    CNodeBase
  );

  _proto.CNode = js.ext.share.data.model.CollectionItem;

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
    return name && this.definition
      ? this.schema.definition.getSchema(name)
      : this.schema;
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

  _proto.load = function (dnode) {
    this.setDataNode(dnode);
    var manifest = this.schema.getChildManifest();
    var items = manifest
      ? this.data.get(manifest.name).values()
      : this.data.values();
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
