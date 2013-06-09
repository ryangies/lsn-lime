js.extend('ext.sitemap', function (js) {

  var CScreen = js.ext.share.Screen;
  
  this.Screen = function (props, smAddr) {
    CScreen.apply(this, [props]);
    this.hasLoaded = false;
    this.tree = null;
    this.menu = null;
    this.crumbView = null;
    this.listView = null;
    this.smAddr = smAddr;
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.load = function (params) {
    // params are ignored
    if (this.hasLoaded) return;
    env.showLoading();
    env.hub.fetch(this.smAddr, [function (dnode) {
      if (dnode) {
        this.tree = new js.ext.share.filesystem.Tree(dnode, js.ext.sitemap.Node);
        this.crumbView = new js.ext.sitemap.view.CrumbView('crumb-view', this.tree);
        this.listView = new js.ext.sitemap.view.ListView('list-view', this.tree);
        this.menu = new js.ext.share.ui.menu.PanelMenu(env, this.tree);
        this.menu.factory['webpage-action'] = js.ext.sitemap.menu.WebpageActionNode;
        this.menu.load([#:json /ext/sitemap/menu.hf]);
        js.dom.replaceChildren('ext-sitemap-area2', this.menu.getElements());
        js.dom.replaceChildren('ext-sitemap-area3', this.crumbView.getElements());
        js.dom.replaceChildren('ext-sitemap-area4', this.listView.getElements());
        this.tree.rootNode.populate();
        this.tree.rootNode.setAsCwd();
        this.tree.rootNode.expand();
        this.hasLoaded = true;
      }
      env.hideLoading();
    }, this]);
  };

});
