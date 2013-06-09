js.extend('ext.editors.live', function (js) {

  var CScreen = js.ext.share.Screen;
  
  this.Screen = function () {
    CScreen.apply(this, arguments);
    this.hasInitialized = false;
    this.panels = new js.ext.share.ui.SwitchList('ext-editors-live-area4');
    this.tabs = new js.ext.share.ui.TabList(this.panels);
    this.tabs.Tab = js.ext.editors.live.ui.Tab;
    this.menu = new js.ext.share.ui.menu.PanelMenu(env, this.panels);
    this.fileSelector = new js.ext.share.FileSelector(this.panels);
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.initialize = function (addr) {
    this.menu.load([#:json /ext/editors/live/menu.hf]);
    // Allow initiators to appear in our left-hand menu
    this.fileMenu = this.menu.loadItem([#:json ./file-menu.hf], env, this.fileSelector);
    env.initiators.addLayer('ext-editors-live-menu', this.fileMenu);
    // Attach to DOM
    js.dom.replaceChildren('ext-editors-live-area2', this.menu.getElements());
    js.dom.replaceChildren('ext-editors-live-area3', this.tabs.getElements());
    this.fileMenu.attachUI();
    this.hasInitialized = true;
  };

  _proto.load = function (params) {
    var addr;
    if (params) {
      if (params.addr) {
        addr = params.addr;
      } else if (params.dnode) {
        addr = params.dnode.getAddress();
      }
    }
    if (!addr && !this.panels.getSelected()) {
      addr = env.getPreference('lsn.ext.dde', 'lastDocument');
    }
    if (!addr) return;
    if (!this.hasInitialized) this.initialize();
    var panel = this.panels.get(addr);
    if (!panel) {
      panel = new js.ext.editors.live.ui.Panel(addr);
      this.panels.add(panel);
//    panel.load(addr);
    }
    this.panels.select(panel, addr);
  };

});
