/** @namespace {#namespace}.target */
js.extend('{#namespace}.target', function (js) {

  var CNodeBase = js.{#namespace}.target.Node;
  var CSelectable = js.ext.share.data.model.Selectable;

  var CNode = this.Item = function (dnode) {
    CNodeBase.apply(this, arguments);
    CSelectable.apply(this);
    this.super = CNodeBase.prototype;
    this.schema = null;
    this.defaultIcon = '/res/icons/16x16/emblems/directory-object.png';
  };

  var _proto = this.Item.prototype = js.lang.createMethods(
    CNodeBase,
    CSelectable
  );

  _proto.onAdopted = function () {
    var schema = this.getSchema();
    this.nameFieldName = schema && schema.nameField
      ? schema.nameField.getName()
      : null;
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

  _proto.getSchema = function (name) {
    if (!this.schema) {
      var myName = this.getDataNode().getString('schema');
      this.schema = this.parentNode.getSchema(myName);
    }
    return name ? this.schema.getSchema(name) : this.schema;
  };

  _proto.getIconPath = function () {
    return this.getSchema().getIconPath();
  };

  /** @function getName */
  _proto.getName = function () {
    return this.nameFieldName
      ? this.data.get(this.nameFieldName)
      : this.data.getKey();
  };

});
