/** @namespace {#namespace} */
js.extend('{#namespace}.model', function (js) {

  var _package = this;
  var CBaseNode = _package.Node;

  _package.CollectionDefinition = function (data, tree) {
    CBaseNode.apply(this, arguments);
    this.schema = env.schemas.fetch("collection-definition");
    this.target = null;
    this.targetSchema = null;
  };

  var _proto = _package.CollectionDefinition.prototype = js.lang.createMethods(
    CBaseNode
  );

  _proto.createNode = function (data) {
    var ctor = js.{#namespace}.model.factory.get('item');
    return new ctor(data, this.tree);
  };

  _proto.populate = function () {
    if (!this.target) return;
    if (this.target.isDirectory()) {
      var commands = [];
      this.target.iterate(function (name, dnode) {
        commands.push(['fetch', dnode.getAddress()]);
      }, this);
      env.hub.batch(commands, [function (response) {
        this.populateValues(this.target);
      }, this]);
    } else {
      this.populateValues(this.target);
    }
  };

  _proto.canExpand = function () {
    return true;
  };

  _proto.loadChildren = function (cb) {
    if (this.target) {
      this.populateChildren();
      this.target.reload(cb);
    }
  };

  _proto.onAdopted = function (action) {
    this.preload();
  };

  _proto.preload = function () {
    var commands = [
      ['fetch', this.data.getString('storage')],
      ['fetch', this.data.getString('schema')]
    ];
    this.data.getDataBridge().batch(commands, [this.onPreload, this]);
  };

  _proto.onPreload = function (commands) {
    this.setup(commands[0].getResult(), commands[1].getResult());
  };

  _proto.setup = function (dnodeStorage, dnodeSchema, cb) {
    var schema = dnodeSchema || dnodeStorage.get('schema');
    env.schemas.fetch(schema, [this.onLoadSchema, this, [dnodeStorage, cb]]);
  };

  _proto.onLoadSchema = function (schema, dnodeStorage, cb) {
    var manifest = schema.getChildManifest();
    var dnodeTarget = manifest && manifest.name
      ? dnodeStorage.get(manifest.name)
      : dnodeStorage;
    this.target = dnodeTarget || dnodeStorage;
    this.target.addActionListener('*', this.onDataAction, this);
    this.targetSchema = schema;
    this.populate();
    if (cb) js.lang.callback(cb);
  };

  _proto.getType = function () {
    return 'collection-definition';
  };

  _proto.getTarget = function () {
    return this.target;
  };

  _proto.getTargetSchema = function () {
    return this.targetSchema;
  };

  _proto.getChildSchema = function (name) {
    if (name) {
      return env.schemas.fetch(
        this.targetSchema.getDataNode().getStorage().getValue(name)
      );
    }
    return this.targetSchema;
  };

  _proto.getAvailableChildSchemas = function () {
    return [this.targetSchema];
  };

});
