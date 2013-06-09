/** @namespace ext.editors.hash.ui */
js.extend('ext.editors.hash.ui', function (js) {

  var _package = this;
  var CView = js.ext.share.ui.View;
  var COptions = js.impl.Options;

  _package.EditView = function (schema) {
    COptions.call(this, {
      'autoCommit': false
    });
    this.schema = schema;
    this.dnode = null;
    this.form = new js.ext.share.input.Form();
    this.schemaLoaded = false;
    CView.call(this);
  };

  var _proto =
      _package.EditView.prototype = js.lang.createMethods(
        COptions,
        CView
      );

  _proto.CFieldView = js.ext.editors.hash.ui.FieldView;

  _proto.setDataNode = function (dnode, bAutoCommit) {
    this.setOption('autoCommit', bAutoCommit);
    this.form.untieValues();
    this.dnode = dnode;
    if (!this.schema && dnode.getValue('schema')) {
      env.schemas.fetch(dnode.getValue('schema'), [function (schema) {
        this.setup(schema);
      }, this]);
    } else {
      this.setup();
    }
  };

  _proto.setup = function (schema) {
    if (schema) {
      this.schemaLoaded = false;
      this.schema = schema;
      js.dom.removeChildren(this.uiTBody);
    }
    if (!this.schemaLoaded) {
      this.form.loadSchema(this.schema);
      this.fieldView.walk(function (item) {
        js.dom.appendChildren(this.uiTBody, item.getElements());
      }, this);
      this.schemaLoaded = true;
    }
    if (this.dnode) {
      this.form.tieValues(this.dnode, this.getOption('autoCommit'));
    }
  };

  _proto.createElements = function () {
    this.uiTBody = js.dom.createElement('TBODY');
    this.uiRoot = js.dom.createElement('TABLE.EditView', [this.uiTBody]);
    this.fieldView = this.form.addLayer('field-layer', this.CFieldView);
    return [this.uiRoot];
  };

  _proto.unload = function () {
    js.dom.removeChildren(this.uiTBody);
    this.form.untieValues();
    this.form.removeAllChildren();
    this.schemaLoaded = false;
  };

  _proto.hasChanged = function () {
    return this.form.hasChanged();
  };

});
