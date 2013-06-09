/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var _package = this;
  var CSchema = _package.Schema;

  _package.SchemaLoader = function () {
    this.schemas = {};
  };

  var _proto = _package.SchemaLoader.prototype = js.lang.createMethods();

  _proto.load = function (data) {
    data.iterate([this.vivifySchema, this]);
  };

  _proto.fetch = function (arg, cb) {
    var schema = null;
    if (!js.util.isDefined(arg)) {
      // Do not invoke callback
      return;
    } else if (js.util.isa(arg, CSchema)) {
      schema = arg;
    } else if (js.util.isa(arg, js.hubb.Node)) {
      var id = arg.getValue('id') || arg.getAddress();
      schema = this.vivifySchema(id, arg);
    } else if (js.util.isAssociative(arg)) {
      schema = new CSchema(arg); // Cannot persist id
      this.schemas[schema.getId()] = schema;
    } else if (js.util.isString(arg)) {
      schema = this.schemas[arg];
      if (!schema) {
        // Treat arg as the address for the data node
        env.hub.get(arg, [this.fetch, this, [cb]])
        return;
      }
    }
    if (cb) js.lang.callback(cb, null, [schema]);
    return schema;
  };

  _proto.vivifySchema = function (id, data) {
    if (!id) throw new Error('Missing schema id');
    var schema = this.schemas[id];
    if (!schema) {
      this.schemas[id] = schema = new CSchema(data, id);
    }
    return schema;
  };

});
