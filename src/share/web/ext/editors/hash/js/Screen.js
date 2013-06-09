js.extend('ext.editors.hash', function (js) {

  var CScreen = js.ext.share.Screen;
  
  this.Screen = function () {
    CScreen.apply(this, arguments);
    this.hasInitialized = false;
    this.editors = new js.ext.share.ui.SwitchList('ext-editors-hash-area4');
    this.tabs = new js.ext.share.ui.TabList(this.editors);
    this.tabs.Tab = js.ext.editors.hash.ui.Tab;
    this.menu = null;
    this.area4 = env.layout.getArea('layout1-area4');
    this.area4.addActionListener('onUpdate', [this.onResize, this]);
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.initialize = function () {
    this.menu = new js.ext.share.ui.menu.PanelMenu(env, this.editors);
    this.menu.load([#:json /ext/editors/hash/menu.hf]);
    js.dom.replaceChildren('ext-editors-hash-area2', this.menu.getElements());
    js.dom.replaceChildren('ext-editors-hash-area3', this.tabs.getElements());
    this.hasInitialized = true;
  };

  _proto.load = function (params) {
    if (!this.hasInitialized) this.initialize();
    if (params && params.dnode) {
      var dnode = params.dnode;
      var iid = dnode.getInstanceId();
      var editor = this.editors.get(iid);
      if (!editor) {
        editor = new js.ext.editors.hash.Editor(iid, params.schema);
        this.editors.add(editor);
      }
      this.editors.select(editor, dnode);
    }
  };

  _proto.onResize = function (action, area) {
    /*
    var r = area.getRegion();
    area.getStyleSheet.updateRule('field-view-term', 150);
    */
  };

});
