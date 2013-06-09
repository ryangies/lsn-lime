/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var _package = this;
  var CView = js.ext.share.ui.View;
  var CFactory = js.ext.share.ObjectFactory;

  _package.EditView = function (tree) {
    CView.apply(this);
    this.factory = new CFactory();
    this.editor = null;
    this.editors = {};
    this.factory.set('summary', js.{#namespace}.Editor, true); // Default
    this.factory.set('hash', js.ext.editors.hash.Editor);
    if (tree) this.setModel(tree);
  };

  var _proto = _package.EditView.prototype = js.lang.createMethods(
    CView
  );

  _proto.setModel = function (tree) {
    js.lang.assert(!this.tree); // Not intended to switch trees in a running view
    this.tree = tree;
    this.tree.addActionListener('onSelect', this.onSelectNode, this);
    this.tree.addActionListener('onDeselect', this.onDeselectNode, this);
//  this.tree.addActionListener('onChangeDirectory', this.onDeselectNode, this);
  };

  _proto.createElements = function () {
    this.uiEditMenu = js.dom.createElement('DIV.editors-menu');
    this.uiEditArea = js.dom.createElement('DIV.editors-area');
    return [this.uiEditArea];
  };

  _proto.getMenuElements = function () {
    return [this.uiEditMenu];
  };

  _proto.onDeselectNode = function (action, mnode) {
    if (this.editor) {
      this.editor.hide();
      this.editor = null;
      js.dom.scrollTo(this.uiEditArea);
      js.dom.removeChildren(this.uiEditMenu);
    }
  };

  _proto.onSelectNode = function (action, mnode) {
    this.editor = this.getEditor(mnode);
    if (this.editor) {
      this.editor.load(mnode);
      this.editor.show(this.uiEditArea);
      try {
        var menu = this.editor.getMenu();
        if (menu) js.dom.replaceChildren(this.uiEditMenu, menu.getElements());
      } catch (ex) {
        js.error.reportError(ex);
      }
    }
  };

  _proto.getEditor = function (mnode) {
    try {
      if (js.util.isa(mnode, js.{#namespace}.model.CollectionList)) return;
      var type = mnode.canExpand() ? 'summary' : 'hash';
      var schemaId = mnode.getTargetSchema().getId();
      if (!schemaId) throw new Error('Schema does not have an ID');
      var id = type + ':' + schemaId;
      var editor = this.editors[id];
      if (!editor) {
        editor = this.factory.createObject(type, id);
        editor.setOption('autoCommit', true);
        this.editors[id] = editor;
      }
      return editor;
    } catch (ex) {
      js.error.reportError(ex);
    }
  };

});
