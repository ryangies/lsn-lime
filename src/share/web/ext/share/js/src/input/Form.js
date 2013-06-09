/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CNode = js.ext.share.input.FormNode;

  _package.Form = function () {
    CNode.apply(this, arguments);
  };

  var _proto = _package.Form.prototype = js.lang.createMethods(
    CNode
  );

/*
 * Not yet, need to switch base class to FormField or other refactor
 * to incoporate the Field interface methods.
 *
  js.ext.share.input.fields.factory.set('form', _package.Form);

  _proto.onAdopted = function () {
    if (!this.hasChildNodes()) {
      this.loadSchema(this.data.schema);
    }
  };
*/

  _proto.fetchSchema = function (addr) {
    env.showLoading();
    env.hub.fetch(addr, [function (dnode) {
      env.hideLoading();
      if (!dnode) {
        env.status.alert('Could not load schema');
        return;
      }
      this.loadSchema(dnode);
    }, this]);
  };

  _proto.loadSchema = function (schema) {
    this.removeAllChildren();
    schema = js.util.isFunction(schema.toObject)
      ? schema.toObject()
      : schema;
    this.appendChildren(schema.fields);
  };

  _proto.getFields = function () {
    var fields = [];
    this.iterate(function (child) {
      fields = fields.concat(child);
    });
    return fields;
  };

  _proto.getNamedFields = function () {
    var result = {};
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      result[field.getName()] = field;
    }
    return result;
  };

  _proto.getVisibleFields = function () {
    var fields = [];
    this.iterate(function (child) {
      if (!child.isHidden()) {
        fields = fields.concat(child);
      }
    });
    return fields;
  };

  _proto.getField = function (name) {
    if (!name) return;
    var result;
    this.iterate(function (child) {
      if (child.getName() == name) {
        result = child;
        return this.BREAK;
      }
    }, this);
    return result;
  };

  _proto.getInputs = function () {
    var result = {};
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      result[field.getName()] = field.input;
    }
    return result;
  };

  _proto.getInput = function (name) {
    var field = this.getField(name);
    if (field) {
      return field.input;
    }
  };

  _proto.getElements = function () {
    var elements = [];
    this.iterate(function (child) {
      elements = elements.concat(child.getElements());
    }, this);
    return elements;
  };

  _proto.getValues = function () {
    var result = {};
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      result[field.getName()] = field.input.getValue();
    }
    return result;
  };

  _proto.setValues = function (values) {
    var inputs = this.getInputs();
    for (key in values) {
      var input = inputs[key];
      if (input) input.setValue(values[key]);
    }
  };

  _proto.focus = function (name) {
    var field = name ? this.getField('name') : this.getVisibleFields()[0];
    if (field) field.focus();
  };

  _proto.select = function (name) {
    var field = name ? this.getField('name') : this.getVisibleFields()[0];
    if (field) field.select();
  };

  _proto.attachUI = function (appendTo) {
    var fields = this.getFields();
    var rows = [];
    for (var i = 0, field; field = fields[i]; i++) {
      if (field.data.type == 'hidden') continue;
      rows = rows.concat(js.dom.createElements(
        field.data.label ? 'DT.form-field=' + field.data.label : null,
        'DD.form-field', [
          field.data.description
            ? 'P.description=' + field.data.description
            : null,
          'DIV.input', field.input.getElements()
        ]
      ));
    }
    js.dom.appendChildren(appendTo, js.dom.createElements('DL.form', rows));
  };

  // TODO

  _proto.disable = function () {
  };

  _proto.enable = function () {
  };

  _proto.reset = function () {
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      field.reset();
    }
  };

  // Values

  _proto.deserializeValues = function (values) {
    var fields = this.getNamedFields();
    for (var key in values) {
      var field = fields[key];
      if (field) field.deserialize(values[key]);
    }
  };

  _proto.serializeValues = function () {
    var result = {};
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      result[field.getName()] = field.serialize();
    }
    return result;
  };

  _proto.getDefaultValues = function () {
    var result = {};
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      var value = field.data.default;
      if (!js.util.isDefined(value)) value = field.serialize();
      result[field.getName()] = value;
    }
    return result;
  };

  _proto.tieValues = function (dnode, bAutoCommit) {
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      try {
        var key = field.getName();
        field.tieValue(dnode, key, bAutoCommit);
      } catch (ex) {
        js.error.reportError(ex);
        js.console.log('Failed to create field:', key);
      }
    }
  };

  _proto.untieValues = function () {
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      field.untieValue();
    }
  };

  _proto.hasChanged = function () {
    var fields = this.getFields();
    for (var i = 0, field; field = fields[i]; i++) {
      if (field.hasChanged()) return true;
    }
    return false;
  };

});
