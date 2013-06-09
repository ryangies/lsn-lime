/** @namespace {#namespace} */
js.extend('{#namespace}.model', function (js) {

  var _package = this;
  var CNode = _package.Node;

  _package.ItemNode = function (data, tree) {
    CNode.apply(this, arguments);
    this.target = null;
    this.defaultIcon = null;
    this.isCategory = false;
  };

  var _proto = _package.ItemNode.prototype = js.lang.createMethods(
    CNode
  );

  _proto.onAdopted = function () {
    try {
      var manifest = this.getSchema().getChildManifest();
      if (manifest) {
        this.isCategory = true;
        this.target = this.getDataNode().getValue(manifest.name);
        this.target.addActionListener('*', this.onDataAction, this);
      }
    } catch (ex) {
      js.console.log('Could not provide storage for child nodes');
    }
  };

  _proto.createNode = function (data) {
    var ctor = js.{#namespace}.model.factory.get('item');
    return new ctor(data, this.tree);
  };

  _proto.getSchema = function () {
    if (!this.schema) {
      var name = this.getTarget().getString('schema');
      this.schema = this.parentNode.getChildSchema(name);
    }
    return this.schema;
  };

  _proto.populate = function () {
    this.populateValues(this.target);
  };

  _proto.getAppendage = function () {
    return this.target || this.data;
  };

  _proto.canExpand = function () {
    return this.isCategory;
  };

  _proto.getType = function () {
    return this.isCategory ? 'category' : this.data.getValue('schema');
  };

  _proto.getChildSchema = function (name) {
    if (name) return this.parentNode.getChildSchema(name);
    var manifest = this.getSchema().getChildManifest();
    return manifest.schemas[0];
  };

});
