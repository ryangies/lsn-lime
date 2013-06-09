/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var _package = this;

  /**
   * @class Schema
   *
   *  !!! This class accepts a `dnode` which defines the schema. However, a
   *  !!! plain-old `Object` can be used. The `getDataNode` is mis-used in
   *  !!! later case, hence the surrounding try/catch blocks.
   */

  _package.Schema = function (dnode, id) {
    if (id) {
      this.id = id;
      this.canPersist = true;
    } else {
      this.id = js.util.rand8();
      this.canPersist = false;
    }
    this.dnode = null;
    this.form = null;
    this.childManifest = null;
    if (dnode) this.load(dnode);
  };

  var _proto = _package.Schema.prototype = js.lang.createMethods(
  );

  /**
   * @function getId - A unique id for this schema
   */

  _proto.getId = function () {
    return this.id;
  };

  /**
   * @function getName - The name which identifies the schema
   *
   * TODO - Needs to be guaranteed, as it is used to set the `schema` value
   * on derived data.
   */

  _proto.getName = function () {
    try {
      return this.getDataNode().isFile()
        ? null
        : this.getDataNode().getKey()
    } catch (ex) {
      return undefined;
    }
  };

  /**
   * @function getLabel - The name presented when selecting a schema
   */

  _proto.getLabel = function () {
    try {
      return this.getDataNode().getString('label') || this.getName();
    } catch (ex) {
      return null;
    }
  };

  /**
   * @function getChildManifest - Information on allowed children
   */

  _proto.getChildManifest = function () {
    try {
      if (this.childManifest) return this.childManifest;
      var manifest = this.getDataValue('children').toObject();
      if (manifest.schema) {
        manifest.schema = this.getSchema(manifest.schema);
      }
      if (manifest.schemas) {
        var schemas = [];
        for (var i = 0; i < manifest.schemas.length; i++) {
          schemas.push(this.getSchema(manifest.schemas[i]));
        }
        manifest.schemas = schemas;
      } else {
        manifest.schemas = [manifest.schema];
      }
      this.childManifest = manifest;
    } catch (ex) {
      return null;
    }
    return this.childManifest;
  };

  /**
   * @function toObject - Resolved properties for this schema
   */

  _proto.toObject = function () {
    var obj = js.util.isFunction(this.dnode.toObject)
      ? this.dnode.toObject()
      : this.dnode;
    if (js.util.isString(obj.schema)) {
      obj.schema = this.getSchema(obj.schema);
    }
    return obj;
  };

  _proto.getSchema = function (name) {
    if (!js.util.isDefined(name)) return this;
    var spec = name;
    if (js.util.isString(name) && js.util.isa(this.dnode, js.hubb.Node)) {
      spec = this.dnode.getStorage().getValue(name);
    }
    return env.schemas.fetch(spec);
  };

  /**
   * @function getDataNode - The defining data node
   */

  _proto.getDataNode = function () {
    return this.dnode;
  };

  /**
   * @function getForm - The input form associated with this schema
   */

  _proto.getForm = function () {
    return this.form;
  };

  /**
   * @function load - Initialize according to a defining data node
   */

  _proto.load = function (dnode) {
    this.dnode = dnode;
    this.data = (js.util.isa(dnode, js.hubb.Node)
        || js.util.isa(dnode, js.data.HashList))
      ? dnode
      : js.data.fromObject(dnode);
    this.form = new js.ext.share.input.Form();
    this.form.loadSchema(this.dnode);
    this.setup();
  };

  /**
   * @function getDataValue
   */

  _proto.getDataValue = function (key) {
    return this.data ? this.data.get(key) : undefined;
  };

  /**
   * @function clone - Create a copy of this schema (for those that modify it)
   */

  _proto.clone = function () {
    return new _package.Schema(this.dnode);
  };

  /**
   * @function setup - After `load`, initialize class members
   */

  _proto.setup = function () {
    this.summaryFields = [];
    this.summaryEditableFields = [];
    // Rifle through the fields list and find those used in the summary
    var firstVisibleField = null;
    var fields = this.form.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      if (field.isHidden()) continue;
      if (!firstVisibleField) firstVisibleField = field;
      if (field.data.is_name_field) this.nameField = field;
      var summary = field.data.summary;
      if (!summary) continue;
      switch (summary) {
        case 'display':
          break;
        case 'edit':
          this.summaryEditableFields.push(field);
          break;
        default:
          js.console.log('Unexpected value for property `summary`:', summary);
      }
      this.summaryFields.push(field);
    }
    // Use the first visible field if none are specified for summary
    if (!this.summaryFields.length) {
      if (firstVisibleField) {
        this.summaryFields.push(firstVisibleField);
//    } else {
//      js.console.log('Schema has no visible fields for summary');
      }
    }
    // Set the (required) field which will be used as the `name`
    if (!this.nameField) this.nameField = this.summaryFields[0];
  };

  /**
   * @function getSummaryFields - Fields used in a summary view
   */

  _proto.getSummaryFields = function () {
    return this.summaryFields;
  };

  /**
   * @function getDefaultValues - Default values according to serialized inputs
   */

  _proto.getDefaultValues = function () {
    return this.form.getDefaultValues();
  };

  _proto.getIconPath = function () {
    try {
      return this.getDataValue('icon').toString();
    } catch (ex) {
      return this.getChildManifest()
        ? '/res/icons/16x16/categories/book-marks.png'
        : '/res/icons/16x16/emblems/directory-object.png';
    }
  };

});
