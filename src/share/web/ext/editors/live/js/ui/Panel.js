/** @namespace ext.editors.live.ui */
js.extend('ext.editors.live.ui', function (js) {

  var _package = this;
  var CAction = js.action.ActionDispatcher;

  _package.Panel = function (name) {
    CAction.apply(this);
    this.name = name;
    this.addr = null;
    this.dnode = null;
    this.uiRoot = null;
    this.createUI();
    this.alResize = env.layout.addActionListener('onPageResize', this.resize, this);
  };

  var _proto = _package.Panel.prototype = js.lang.createMethods(
    CAction
  );

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.createUI = function () {
    this.uiToolbar = js.dom.createElement('DIV.dde-layout-toolbar');
    this.uiFrame = js.dom.createElement('IFRAME.dde-layout-doc', {
      'name': 'docframe',
      'frameborder': '0',
      'scrolling': 'yes',
      'src': 'about:blank'
    });
    this.uiStatus = js.dom.createElement('DIV.dde-layout-statusbar');
    return this.uiRoot = js.dom.createElement('DIV', [
      this.uiToolbar,
      this.uiFrame,
      this.uiStatus
    ]);
  };

  _proto.resize = function (action) {
  };

  _proto.focus = function () {
  };

  _proto.close = function () {
    js.dom.removeElement(this.uiRoot);
    this.alResize.remove();
    this.addr = null;
    this.dnode = null;
    this.uiRoot = null;
    this.executeClassAction('onClose', this);
  };

  /** Switchable interface (see js.ext.share.SwitchList) */

  _proto.getName = function () {
    return this.name;
  };

  /**
   * Hide/show for content which contains IFRAME elements shouldn't add or remove
   * themselves from the DOM (otherwise the inner document will be reloaded).
   */

  _proto.show = function (appendTo, cb) {
    if (!this.uiRoot.parentNode) {
      appendTo.appendChild(this.uiRoot);
    }
    js.dom.setOpacity(this.uiRoot, 1);
    js.dom.setStyles(this.uiRoot, {'z-index':'1', 'visibility':'visible'});
    // Create DDE
    this.resize();
    this.executeClassAction('onShow', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.hide = function (cb) {
    js.dom.setOpacity(this.uiRoot, 0);
    js.dom.setStyles(this.uiRoot, {'z-index':'-1', 'visibility':'hidden'});
    this.executeClassAction('onHide', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.reload = function (addr) {
    this.executeClassAction('onReady', this);
  };

  _proto.load = function (addr) {
    if (!addr) return;
    if (addr === this.addr) {
      this.executeClassAction('onReady', this);
    } else {
      this.addr = addr;
      this.dde = new js.lsn.ext.dde.Application(
        this.uiRoot,
        this.uiToolbar,
        this.uiStatus,
        this.uiFrame
      );
      this.dde.addActionListener('onOpen', this.onEditorOpen, this);
      this.dde.load(addr);
      this.executeClassAction('onLoad', this);
    }
  }

  _proto.onEditorOpen = function (action) {
    this.addr = this.dde.docLoc.pathname;
    if (/\/$/.test(this.addr)) {
      // TODO - The DDE applicaiton needs to know the real file. This
      // should be done by the server, setting a header as well as
      // the correct meta tag for canonical path.
      this.addr += 'index.html';
    }
    env.hub.get(this.addr, [this.onGetDataNode, this]);
    this.dispatchAction('onOpen', this.addr);
  };

  _proto.onGetDataNode = function (dnode) {
    this.dnode = dnode;
    this.executeClassAction('onReady', this);
  };

  _proto.getDataNode = function () {
    return this.dnode;
  };


});
