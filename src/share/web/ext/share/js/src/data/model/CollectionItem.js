/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var CNodeBase = js.ext.share.data.model.Node;

  var CNode = this.CollectionItem = function (dnode) {
    CNodeBase.apply(this, arguments);
    this.super = CNodeBase.prototype;
    this.schema = null;
  };

  var _proto = this.CollectionItem.prototype = js.lang.createMethods(
    CNodeBase
  );

  _proto.onAdopted = function () {
    var schema = this.getSchema();
    this.nameFieldName = schema.nameField.getName();
  };

  /**
   * @function createNode
   */

  _proto.createNode = function (data) {
    // We do not need to collect child nodes (fields)
  };

  /**
   * @function getSchema
   */

  _proto.getSchema = function () {
    if (!this.schema) {
      var name = this.getDataNode().getString('schema');
      this.schema = this.rootNode.getSchema(name);
    }
    return this.schema;
  };

  /** @function getName */
  _proto.getName = function () {
    return this.nameFieldName
      ? this.data.get(this.nameFieldName)
      : this.data.getKey();
  };

});
