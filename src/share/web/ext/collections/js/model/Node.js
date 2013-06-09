/** @namespace {#namespace} */
js.extend('{#namespace}.model', function (js) {

  var CFilesystemNode = js.ext.share.filesystem.Node;

  var CNode = this.Node = function (data, tree) {
    CFilesystemNode.apply(this, arguments);
    this.schema = null;
  };

  var _proto = this.Node.prototype = js.lang.createMethods(
    CFilesystemNode
  );

/* -- Overrides ------------------------------------------------------------- */

  /**
   * @function createNode
   */

  _proto.createNode = function (data) {
    js.lang.assert(this !== this.rootNode);
    return this.rootNode.createNode.apply(this.rootNode, arguments);
    //return new CNode(data, this.tree);
  };

  /**
   * @function sortCompare
   */

  _proto.sortCompare = function (a, b) {
    if (!(js.util.defined(a) && js.util.defined(b))) return;
    var av = a.data.getIndex();
    var bv = b.data.getIndex();
    var rv = av - bv;
    return rv;
  };

  /**
   * @function canDisplay
   */

  _proto.canDisplay = function () {
    return this.data && this.data.isDataContainer();
  };

  _proto.canExpand = function () {
    return false;
  };

  /**
   * @function getName
   * Must return a sv that can .tie (see ListView)
   */

  _proto.getName = function () {
    var schema = this.getSchema();
    var fieldName = schema.nameField.getName();
    return this.data.getValue(fieldName);
  };

  /**
   * @function getIconPath
   */

  _proto.getIconPath = function () {
    return this.getSchema().getIconPath();
  };

  /**
   * @function getType
   */

  _proto.getType = function () {
    return this.data.getValue('schema');
  };

  /**
   * @function getTargetAddress
   */

  _proto.getTargetAddress = function () {
    return this.data.getDataNode().getAddress();
  };

  /**
   * @function getCrumbPath
   */

  _proto.getCrumbPath = function () {
    var name = [];
    var node = this;
    while (node && node !== this.rootNode) {
      name.unshift(node.getName());
      node = node.parentNode;
    }
    return name.join(' > ');
  };

/* -- End overrides --------------------------------------------------------- */

  _proto.getAppendage = function () {
    return this.getTarget();
  };

  /**
   * @function getSchema - The schema which defines this.data
   */

  _proto.getSchema = function () {
    return this.schema;
  };

  /**
   * @function getTarget - The storage for items
   */

  _proto.getTarget = function () {
    return this.data.getDataNode();
  };

  /**
   * @function getTargetSchema - The schema or schemas...
   */

  _proto.getTargetSchema = function () {
    return this.schema;
  };

  _proto.getChildSchema = function (name) {
    // XXX name?
    return this.getAvailableSchemas()[0];
  };

  _proto.getAvailableChildSchemas = function () {
    var manifest = this.getSchema().getChildManifest();
    return manifest ? manifest.schemas : [];
  };

});
