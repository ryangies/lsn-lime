/** @namespace {#namespace} */
js.extend('{#namespace}', function (js) {

  var _package = this;
  var _strings = {#:json strings};

  var COptions = js.impl.Options;
  var CAction = js.action.ActionDispatcher;
  var CView = js.ext.share.ui.View;

  var CEditor = _package.Editor = function (name) {
    COptions.call(this, {'autoCommit': true});
    CAction.apply(this);
    CView.apply(this);
    this.name = name;
    this.itemMenu = null;
    this.views = [];
  };

  var _proto = CEditor.prototype = js.lang.createMethods(
    COptions,
    CAction,
    CView
  );

  _proto.createElements = function () {
    this.uiRoot = js.dom.createElement('DIV#{#screen/id}-editor');
    return [this.uiRoot];
  };

  _proto.close = function () {
    this.unload();
    this.hide();
    this.executeClassAction('onClose', this);
  };

/** Switchable interface (see js.ext.share.SwitchList) */

  _proto.getName = function () {
    return this.name;
  };

  _proto.getTitle = function () {
    return this.name;
  };

  _proto.show = function (appendTo, cb) {
    js.dom.appendChildren(appendTo, this.getElements());
    this.executeClassAction('onShow', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.hide = function (cb) {
    js.dom.removeElements(this.getElements());
    this.executeClassAction('onHide', this);
    if (cb) js.lang.callback(cb);
  };

/** END Switchable */

  _proto.load = function (mnode) {
    this.unload();
    var itemsData = mnode.getAppendage();
    var itemsSchemas = mnode.getAvailableChildSchemas();
    this.tree = new js.{#namespace}.target.Collection(itemsData, itemsSchemas[0]);
    for (var i = 0; i < itemsSchemas.length; i++) {
      this.createView(itemsSchemas[i], '{#screen/id}-select-item');
    }
    this.createMenu();
    this.executeClassAction('onLoad', this);
    this.executeClassAction('onReady', this);
  };

  _proto.loadDataAndSchema = function (itemsData, itemsSchema) {
    this.unload();
    this.tree = new js.{#namespace}.target.Collection(itemsData, itemsSchema);
    this.createView(itemsSchema);
    this.createMenu();
    this.executeClassAction('onLoad', this);
    this.executeClassAction('onReady', this);
  };

  _proto.createView = function (schema, action) {
    var view = new js.{#namespace}.view.SummaryView(this.tree, schema);
    if (action) view.setAction(action);
    this.views.push(view);
    js.dom.appendChildren(this.uiRoot, view.getElements());
  };

  _proto.reload = function () {
    this.executeClassAction('onReady', this);
  };

  _proto.unload = function () {
    try {
      CView.prototype.unload.apply(this);
      while (this.views.length) {
        this.views.pop().unload();
      }
      if (this.tree) this.tree.deselect();
      js.dom.removeChildren(this.uiRoot);
      this.executeClassAction('onUnload', this);
    } catch (ex) {
      js.console.log(ex);
    }
  };

  _proto.createMenu = function () {
    var menuData = {#:json ../menu-editor.hf, -compile => 1};
    if (this.itemMenu) {
      this.itemMenu.setSelector(this.tree);
    } else {
      this.itemMenu = new js.ext.share.ui.menu.PanelMenu(env, this.tree);
      this.itemMenu.load(menuData);
    }
  };

  _proto.getMenu = function () {
    return this.itemMenu;
  };

  _proto.getStorage = function () {
    return this.tree ? this.tree.getDataNode() : null;
  };

  _proto.getSchema = function () {
    return this.tree ? this.tree.getSchema() : null;
  };

  /**
   * @function onUserCreate
   * Called by the new-item handler when the user creates a new item.
   */

  _proto.onUserCreate = function (dnode) {
    var tnode = this.tree.getNodeByData(dnode);
    if (tnode) tnode.select();
  };

});
