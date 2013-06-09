js.extend('ext.filesystem', function (js) {

  var CScreen = js.ext.share.Screen;
  
  this.Screen = function () {
    CScreen.apply(this, arguments);
    this.tree = null;
    this.rootAddress = null;
    this.menuConfig = [#:json /ext/filesystem/menu.hf];
    this.popupConfig = [#:json /ext/filesystem/popup.hf];
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.load = function (params) {
    if (!this.rootAddress) {
      var openTo = params && params.addr
        ? params.addr
        : env.getPreference('ext-filesystem', 'last-cwd');
      params = js.util.overlay({'addr': '/'}, params);
      this.rootAddress = params.addr;
      env.showLoading();
      env.hub.fetch(this.rootAddress, [function (dnode) {

        // The model
        this.tree = new js.ext.share.filesystem.Tree(dnode);
        this.tree.addActionListener('onChangeDirectory', this.onChangeDirectory, this);

        // The two main navigational views
        this.crumbView = new js.ext.filesystem.view.CrumbView('crumb-view', this.tree);
        this.listView = new js.ext.filesystem.view.ListView('list-view', this.tree);

        // The left-hand panel menu
        this.listMenu = new js.ext.share.ui.menu.PanelMenu(env, this.tree);
        this.listMenu.load(this.menuConfig);
        env.initiators.addLayer('fs-list-menu', this.listMenu.lastChild);

        // The pop-up context menu
        var contextMenu = new js.ext.share.ui.menu.PanelMenu(env, this.tree);
        contextMenu.load(this.popupConfig);
        env.initiators.addLayer('fs-context-menu', contextMenu.firstChild);
        env.dialogs.register('ext-filesystem-context-menu',
          js.ext.share.ui.menu.PopupMenu,
          [function () {
            this.setContent(contextMenu.getElements());
          }, null, [contextMenu]]
        );

        // Attach to DOM
        js.dom.replaceChildren('fs-crumb-view', this.crumbView.getElements());
        js.dom.replaceChildren('fs-list-view', this.listView.getElements());
        js.dom.replaceChildren('fs-menu-view', this.listMenu.getElements());

        // Populate data
        this.tree.rootNode.populate();
        this.tree.rootNode.setAsCwd();
        if (openTo) {
          this.tree.selectCwdByAddress(openTo, function () {
            env.hideLoading();
          });
        } else {
          this.tree.rootNode.expand();
          env.hideLoading();
        }

      }, this]);

    } else if (params && params.addr) {
      this.tree.expandNodeByAddress(params.addr);
    }
  };

  _proto.onChangeDirectory = function (action, cwd) {
    env.setPreference('ext-filesystem', 'last-cwd', cwd.data.getAddress());
  };

});
