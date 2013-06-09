js.extend('ext.desktop', function (js) {

  var CScreen = js.ext.share.Screen;
  
  this.Screen = function () {
    CScreen.apply(this, arguments);
    this.panels = new js.ext.share.ui.SwitchList('ext-desktop-screen');
    this.openPanel = null;
    env.registerHandler('open-desktop-panel', [this.openDesktopPanel, this]);
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.onShow = function () {
    var panel = this.panels.getSelected();
    if (this.openPanel) {
      this.panels.select(this.openPanel);
      this.openPanel = null;
    }
  };

  _proto.onHide = function () {
    this.openPanel = this.panels.deselect();
  };

  _proto.openDesktopPanel = function (action, arg) {
    var panel = this.panels.get(arg);
    if (!panel) {
      panel = new js.ext.desktop.Panel(arg);
      this.panels.add(panel);
    }
    this.panels.select(panel);
  };

});
