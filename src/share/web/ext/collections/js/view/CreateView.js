/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var _package = this;
  var CBaseView = js.ext.share.ui.Dialog;

  var CCreateView = _package.CreateView = function () {
    CBaseView.apply(this, arguments);
    this.editor = null;
    this.editors = {};
  };

  var _proto
    = CCreateView.prototype
    = js.lang.createPrototype(CBaseView);

  _proto.onDialogShow = function (schema, cb) {
    this.editor = this.vivifyEditor(schema);
    if (this.editor) {
      this.cb = cb;
      this.editor.view.setup();
      this.editor.show(this.getElementById('content'));
    }
  };

  _proto.onDialogHide = function () {
    this.cb = null;
    this.editor = null;
    js.dom.removeChildren(this.getElementById('content'));
  };

  _proto.invokeCallback = function () {
    if (this.cb) js.lang.callback(this.cb, this, [this.getValues()]);
  };

  _proto.getValues = function () {
    return this.editor.view.form.getValues();
  };

  _proto.vivifyEditor = function (schema) {
    try {
      var id = schema.getId();
      var editor = this.editors[id];
      if (!editor) {
        if (!schema) throw new Error('No schema available');
        this.editors[id]
          = editor
          = new js.ext.editors.hash.Editor(id, schema);
        editor.setOption('autoCommit', true);
      }
      return editor;
    } catch (ex) {
      js.console.log(ex);
    }
  };

});
