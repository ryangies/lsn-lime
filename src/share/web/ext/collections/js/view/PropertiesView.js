/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var _package = this;
  var COverlayView = js.ext.share.ui.Overlay;

  var CPropertiesView = _package.PropertiesView = function () {
    COverlayView.apply(this, arguments);
    this.editor = null;
    this.editors = {};
  };

  var _proto
    = CPropertiesView.prototype
    = js.lang.createPrototype(COverlayView);

  _proto.onDialogShow = function (mnode) {
    this.editor = this.vivifyEditor(mnode);
    if (this.editor) {
      this.editor.load(mnode.getDataNode());
      this.editor.show(this.getElementById('content'));
    }
  };

  _proto.onDialogHide = function () {
    js.dom.removeChildren(this.getElementById('content'));
  };

  _proto.vivifyEditor = function (mnode) {
    try {
      var schema = mnode.getSchema();
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
