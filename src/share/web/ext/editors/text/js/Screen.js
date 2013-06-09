js.extend('ext.editors.text', function (js) {

  var CScreen = js.ext.share.Screen;
  var CHandlerPool = js.action.HandlerPool;
  
  this.Screen = function () {
    CHandlerPool.apply(this);
    CScreen.apply(this, arguments);
    this.hasInitialized = false;
    this.editors = new js.ext.share.ui.SwitchList('ext-editors-text-screen');
    this.tabs = new js.ext.share.ui.TabList(this.editors);
    this.tabs.Tab = js.ext.editors.text.ui.Tab;
    this.fileSelector = new js.ext.share.FileSelector(this.editors);
    this.kp = new js.dom.KeyPress();
    this.kp.addHandler('ctrl+s', this.onKeyPress, this, ['ext-editors-text-file-save']);
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CHandlerPool,
    CScreen
  );

  _proto.initialize = function () {
    // The left-hand menu
    this.menu = new js.ext.share.ui.menu.PanelMenu(env, this.editors);
    this.menu.load([#:json ./menu.hf]);
    // Allow initiators to appear in our left-hand menu
    this.fileMenu = this.menu.loadItem([#:json ./file-menu.hf], env, this.fileSelector);
    env.initiators.addLayer('ext-editors-text-menu', this.fileMenu);
    // Attach to DOM
    js.dom.appendChildren('ext-editors-text-menu', this.menu.getElements());
    js.dom.replaceChildren('ext-editors-text-tabs', this.tabs.getElements());
    this.fileMenu.attachUI();
    this.hasInitialized = true;
  };

  /**
   * @function load
   *
   * @param params <Hash> Parameters
   * @param params.dnode <js.hubb.Node> File-system Node
   */

  _proto.load = function (params) {
    if (!this.hasInitialized) {
      this.initialize();
      this.restoreState([this.load, this, params]);
      return;
    }
    if (params && params.dnode) {
      var dnode = params.dnode;
      var name = dnode.getAddress();
      var editor = this.editors.get(name);
      if (!editor) {
        editor = new js.ext.editors.text.Editor(name);
        editor.addActionListener('onClose', this.onEditorClose, this);
        editor.addActionListener('onLoad', this.onEditorLoad, this);
        this.editors.add(editor);
      }
      if (!params.background) {
        this.editors.select(editor, dnode);
      }
    }
  };

  _proto.onEditorClose = function (action, editor) {
    this.editors.remove(editor);
    this.saveState();
  };

  _proto.onEditorLoad = function (action, editor) {
    this.saveState();
  };

  _proto.show = function () {
    CScreen.prototype.show.apply(this, arguments);
    this.kp.attach(js.window);
    var editor = this.editors.getSelected();
    if (editor) editor.focus();
  };

  _proto.hide = function () {
    this.kp.detach(js.window);
    CScreen.prototype.hide.apply(this, arguments);
  };

  _proto.onKeyPress = function (event, actionName) {
    js.dom.stopEvent(event);
    env.invokeHandler(actionName, this.editors.getSelected());
  };

  _proto.saveState = function () {
    var openFiles = [];
    for (var i = 0; i < this.editors.items.length; i++) {
      var editor = this.editors.items[i];
      var addr = editor.getTargetAddress();
      if (addr) openFiles.push(addr);
    }
    env.setPreference('ext-editors-text', 'open-files', openFiles);
    var editor = this.editors.getSelected();
    if (editor) {
      var selected = editor.getTargetAddress();
      env.setPreference('ext-editors-text', 'selected', selected);
    } else {
      env.removePreference('ext-editors-text');
    }
  };

  _proto.restoreState = function (cb) {
    var openFiles = env.getPreference('ext-editors-text', 'open-files');
    if (openFiles && openFiles.length) {
      var selected = env.getPreference('ext-editors-text', 'selected');
      var batch = [];
      for (var i = 0; i < openFiles.length; i++) {
        batch.push(['fetch', openFiles[i]]);
      }
      env.hub.batch(batch, [function (results) {
        for (var i = 0; i < results.length; i++) {
          var dnode = results[i].getResult();
          this.load({
            'dnode': dnode,
            'background': false
          });
        }
        if (cb) js.lang.callback(cb);
      }, this]);
    } else {
      if (cb) js.lang.callback(cb);
    }
  };

});
