/** @namespace ext.editors.text */
js.extend('ext.editors.text', function (js) {

  var _package = this;

  var _strings = [#:json ./strings.hf];

  var _helper = js.ext.share.contrib.codemirror;

  var _defaultParams = {
    'mode': 'text/plain',
    'lineNumbers': true,
    'lineWrapping': false,
    'smartIndent': false,
    'electricChars': false,
    'autoClearEmptyLines': true,
    'extraKeys': {
      'Tab': 'indentMore',
      'Shift-Tab': 'indentLess'
    },
    'document': js.document
  };

  var CAction = js.action.ActionDispatcher;

  var CEditor = _package.Editor = function (name) {
    CAction.apply(this);
    this.name = name;
    this.conflict = false;
    this.editor = null;
    this.dnode = null;
    this.uiRoot = null;
    this.alUpdate = null;
    this.alBeforeUnload = env.layout.addActionListener(
      'onPageBeforeUnload', this.onBeforeUnload, this
    );
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

  _proto.getDataNode = function () {
    return this.dnode;
  };

  _proto.getUI = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    var cb = js.lang.createCallback(function (wrapper) {
      this.uiRoot = wrapper;
    }, this);
    var params = js.util.overlay({}, _defaultParams);
    this.editor = CodeMirror(cb, params);
    var eltScroller = this.editor.getScrollerElement();
    var eltWrapper = this.uiRoot;
    js.dom.addClassName(eltWrapper, 'layout1-area4');
    js.dom.addClassName(eltScroller, 'layout1-area4-height');
    return this.uiRoot;
  };

  /** External API */

  _proto.getValue = function () {
    return this.editor.getValue();
  };

  _proto.setValue = function (value) {
    if (value === this.marshal()) {
      return;
    }
    this.cursor = this.editor.getCursor();
    var result = this.editor.setValue(value);
    this.editor.setCursor(this.cursor);
    this.editor.clearHistory();
    delete this.cursor;
    return result;
  };

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
    this.cursor = this.editor.getCursor();
    this.unload();
    this.load(dnode);
  };

  _proto.focus = function () {
    if (this.editor) {
      this.editor.refresh(); // For redraw after unhiding
      this.editor.focus();
    }
  };

  _proto.close = function () {
    try {
      if (this.hasChanged()) {
        env.status.confirm(_strings.on_discard, [function (result) {
          if (result) this.doClose();
        }, this]);
        return;
      }
    } catch (ex) {
      js.error.reportError(ex);
    } finally {
      this.doClose();
    }
  };

  _proto.doClose = function () {
    this.unload();
    this.hide();
    this.executeClassAction('onClose', this);
  };

  /** Switchable interface (see js.ext.share.SwitchList) */

  /**
   * XXX IE8 display issues, the editors are not hiding. Tried a simple z-index
   * trick, however that just keeps them from showing at all. Hmph.
   *
   *  js.dom.setStyle(this.uiRoot, 'z-index', '1');
   *  js.dom.setStyle(this.uiRoot, 'z-index', '-1');
   */

  _proto.getName = function () {
    return this.name;
  };

  _proto.getTargetAddress = function () {
    try {
      return this.dnode.getAddress();
    } catch (ex) {
      return null;
    }
  };

  _proto.show = function (appendTo, cb) {
    appendTo.appendChild(this.getUI());
    js.dom.setOpacity(this.uiRoot, 1);
    this.focus();
    this.executeClassAction('onShow', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.hide = function (cb) {
    js.dom.setOpacity(this.uiRoot, 0);
    this.executeClassAction('onHide', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.load = function (dnode) {
    if (dnode && dnode !== this.dnode) {
      this.unload();
      env.showLoading();
      dnode.reload([this.onDataLoad, this]);
    } else {
      this.executeClassAction('onReady', this);
    }
  };

  /** Internal API */

  _proto.unload = function () {
    this.dnode = null;
    if (this.editor) this.editor.setValue('');
    if (this.alUpdate) this.alUpdate.remove();
    if (this.alRemove) this.alRemove.remove();
  };

  _proto.onDataLoad = function (dnode) {
    env.hideLoading();
    this.unmarshal(dnode);
    _helper.loadMode(_helper.getModeByType(dnode.getType(), dnode.getKey()), this.editor);
    this.alUpdate = dnode.addActionListener('update', this.onNodeUpdated, this);
    this.alRemove = dnode.addActionListener('remove', this.onNodeRemoved, this);
    this.executeClassAction('onLoad', this);
    this.executeClassAction('onReady', this);
  };

  _proto.onReady = function () {
    if (this.cursor) {
      this.editor.setCursor(this.cursor);
      delete this.cursor;
    }
    this.focus();
  };

  _proto.unmarshal = function (dnode) {
    var content = dnode.getContent();
    var value = js.util.defined(content) ? content : '';
    this.setValue(value);
    this.baseContent = this.marshal();
    this.conflict = false;
    this.dnode = dnode;
  };

  _proto.marshal = function () {
    return this.editor.getValue();
  };

  _proto.onNodeUpdated = function (action, dnode) {
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
    var content = this.marshal();
    return this.baseContent !== content;
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
    var cursor = this.editor.getCursor();
    var value = this.marshal();
    var addr = this.dnode.getAddress();
    this.baseContent = value;
    env.showLoading();
    this.dnode.getDataBridge().store(addr, value, [this.onStore, this, [cursor]]);
  };

  _proto.onStore = function (dnode, cursor) {
    env.hideLoading();
    if (dnode) {
      env.status.notify(_strings.on_saved);
      this.dispatchAction('saved', dnode);
      this.editor.setCursor(cursor);
      this.editor.focus();
    } else {
      env.status.alert(_strings.on_notsaved);
      this.dispatchAction('notsaved', dnode);
    }
  };

});
