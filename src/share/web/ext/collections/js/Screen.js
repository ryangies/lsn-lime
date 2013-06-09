/** @namespace {#namespace} */
js.extend('{#namespace}', function (js) {

  var CScreen = js.ext.share.Screen;
  var CRootNode = js.{#namespace}.model.CollectionList;
  var CCrumbView = js.{#namespace}.view.CrumbView;
  var CTreeView = js.{#namespace}.view.TreeView;
  var CEditView = js.{#namespace}.view.EditView;
  var CPanelMenu = js.ext.share.ui.menu.PanelMenu;
  
  this.Screen = function (props, target) {
    CScreen.apply(this, [props]);
    this.hasLoaded = false;
    this.tree = null;
    this.menu = null;
    this.crumbView = null;
    this.treeView = null;
    this.target = target;
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CScreen
  );

  _proto.load = function (params) {
    // params are ignored
    if (this.hasLoaded) return;
    env.showLoading();
    env.hub.fetch(this.target, [function (dnode) {
      env.hideLoading();
      if (dnode) {
        this.tree = new js.ext.share.filesystem.Tree(dnode, CRootNode);
        this.crumbView = new CCrumbView('{#screen/id}-crumb-view', this.tree);
//      this.treeView = new CTreeView('{#screen/id}-tree-view', this.tree);
        this.treeView = new CTreeView('{#screen/id}-select-view', this.tree);
        this.editView = new CEditView(this.tree);
        this.menu = new CPanelMenu(env, this.tree);
        this.menu.load({#:json ../menu.hf, -compile => 1});
        js.dom.replaceChildren('{#screen/id}-area3', this.crumbView.getElements());
        js.dom.replaceChildren('{#screen/id}-area2', this.treeView.getElements());
        js.dom.replaceChildren('{#screen/id}-area5', this.editView.getElements());
        js.dom.replaceChildren('{#screen/id}-area6', this.menu.getElements());
        js.dom.appendChildren('{#screen/id}-area6', this.editView.getMenuElements());
        this.tree.rootNode.populate();
        this.tree.rootNode.setAsCwd();
        this.tree.rootNode.expand();
        this.hasLoaded = true;
      } else {
        js.dom.replaceChildren('{#screen/id}-area5',
          js.dom.createElements(
            'P', {'innerHTML': '{#strings/missing_collections}'},
            'TT', {'innerHTML': this.target}
          )
        );
      }
    }, this]);
  };

  _proto.getModel = function () {
    return this.tree;
  };

});
/*

        js.{#namespace}.j

          this.tree.registerType(type, model)
          this.treeView.registerType(type, view)
          this.editView.registerType(type, editor)
          this.menu.registerType(type, menu)
          this.handlers.load(handlers)

        }

*/
