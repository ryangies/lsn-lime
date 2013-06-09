/** @namespace ext.editors.hash */
js.extend('ext.editors.hash', function (js) {

  var _package = this;
  var _strings = [#:json ./strings.hf];

  var CAction = js.action.ActionDispatcher;

  var CEditor = _package.Editor = function (name, schema) {
    CAction.apply(this);
    this.options = {
      'autoCommit': false
    };
    this.name = name;
    this.schema = schema;
    this.conflict = false;
    this.isStoring = false;
    this.dnode = null;
    this.uiRoot = null;
    this.alUpdate = null;
    this.alBeforeUnload = env.layout.addActionListener(
      'onPageBeforeUnload', this.onBeforeUnload, this
    );
    this.createUI();
    this.createView();
  };

  var _proto = CEditor.prototype = js.lang.createMethods(
    CAction
  );

  _proto.onBeforeUnload = function (action, event) {
    if (!this.dnode) return;
    if (!this.hasChanged()) return;
    var addr = this.dnode.getAddress();
    var msg = _string.on_abandon + "(" + addr + ")";
    if (event) event.returnValue = msg;
    return msg;
  };

  _proto.getOption = function (key) {
    return this.options[key];
  };

  _proto.setOption = function (key, value) {
    if (key in this.options) {
      return this.options[key] = value;
    } else {
      throw new Error('Not an option:' + key);
    }
  };

  _proto.getDataNode = function () {
    return this.dnode;
  };

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  /**
   * @function getMenu
   *
   * Part of the [inwork] editor API. This should return a PanelMenu type
   * object.
   */

  _proto.getMenu = function () {
  };

  _proto.createUI = function () {
    this.uiRoot = js.dom.createElement('DIV#ext-editors-hash-Editor');
  };

  _proto.createView = function () {
    if (this.view) {
      if (this.schema === this.view.schema) return;
      this.view.unload();
    }
    this.view = new js.ext.editors.hash.ui.EditView(this.schema);
    js.dom.replaceChildren(this.uiRoot, this.view.getElements());
  };

  /** External API */

  _proto.reload = function () {
    if (this.hasChanged()) {
      env.status.confirm(_strings.on_discard, [function (result) {
        if (result) this.doReload();
      }, this]);
      return;
    }
    this.doReload();
  };

  _proto.doReload = function () {
    var dnode = this.dnode;
    this.unload();
    this.load(dnode);
  };

  _proto.focus = function () {
    // TODO
    // This view .focus
  };

  _proto.close = function () {
    if (this.hasChanged()) {
      env.status.confirm(_strings.on_discard, [function (result) {
        if (result) this.doClose();
      }, this]);
      return;
    }
    this.doClose();
  };

  _proto.doClose = function () {
    this.unload();
    this.hide();
    this.executeClassAction('onClose', this);
  };

  /** Switchable interface (see js.ext.share.SwitchList) */

  _proto.getName = function () {
    return this.name;
  };

  _proto.show = function (appendTo, cb) {
    js.dom.appendChildren(appendTo, this.getElements());
    js.dom.setOpacity(this.uiRoot, 1);
    js.dom.setStyle(this.uiRoot, 'visibility', 'visible'); // So controls are active
    this.focus();
    this.executeClassAction('onShow', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.hide = function (cb) {
    js.dom.setOpacity(this.uiRoot, 0);
    js.dom.setStyle(this.uiRoot, 'visibility', 'hidden'); // So controls are disabled
    this.executeClassAction('onHide', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.load = function (node) {
    var dnode = node.getDataNode();
    if (dnode && dnode !== this.dnode) {
      if (this.dnode) this.unload();
      env.showLoading();
      if (js.util.isFunction(node.getSchema)) {
        this.schema = node.getSchema();
        this.createView();
      }
      dnode.reload([this.onDataLoad, this]);
    } else {
      this.executeClassAction('onReady', this);
    }
  };

  /** Internal API */

  _proto.unload = function () {
    this.dnode = null;
    this.schema = null;
    if (this.alUpdate) this.alUpdate.remove();
    if (this.alRemove) this.alRemove.remove();
  };

  _proto.onDataLoad = function (dnode) {
    env.hideLoading();
    this.unmarshal(dnode);
    this.alUpdate = dnode.addActionListener('update', this.onNodeUpdated, this);
    this.alRemove = dnode.addActionListener('remove', this.onNodeRemoved, this);
    this.executeClassAction('onLoad', this);
    this.executeClassAction('onReady', this);
  };

  _proto.onReady = function () {
    this.focus();
  };

  _proto.unmarshal = function (dnode) {
    this.conflict = false;
    this.dnode = dnode;
    this.view.setDataNode(dnode, this.getOption('autoCommit'));
  };

  _proto.marshal = function () {
    return this.view.form.serializeValues();
  };

  _proto.onNodeUpdated = function (action, dnode) {
    if (this.isStoring || this.getOption('autoCommit')) return;
    if (!this.hasChanged()) {
      this.unmarshal(dnode);
    } else {
      this.conflict = true;
      env.status.confirm(_strings.on_conflict, [function (result) {
        if (result) {
          this.unmarshal(dnode);
        } else {
          this.dispatchAction('conflict', dnode);
        }
      }, this]);
    }
  };

  _proto.onNodeRemoved = function (action, dnode) {
    this.doClose();
  };

  _proto.hasChanged = function () {
    return this.view && this.view.hasChanged();
  };

  _proto.store = function () {
    if (this.conflict) {
      env.status.confirm(_strings.on_overwrite, [this.doStore, this]);
    } else {
      this.doStore(true);
    }
  };

  _proto.doStore = function (confirmed) {
    if (!confirmed) return;
    var values = this.marshal();
    var addr = this.dnode.getAddress();
    env.showLoading();
    this.dnode.getDataBridge().update(addr, values, [this.onStore, this]);
    /*
    if (this.rename) {
      this.dnode.getDataBridge().rename(addr, newName, [this.onRename, this]);
    }
    */
    this.isStoring = true;
  };

  _proto.onStore = function (dnode) {
    env.hideLoading();
    this.isStoring = false;
    if (dnode) {
      env.status.notify(_strings.on_saved);
      this.dispatchAction('saved', dnode);
      this.focus();
    } else {
      env.status.alert(_strings.on_notsaved);
      this.dispatchAction('notsaved', dnode);
    }
  };

});
