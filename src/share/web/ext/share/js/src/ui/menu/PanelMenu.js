/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;

  /**
   * @class PanelMenu
   */

  Package.PanelMenu = function CPanelMenu (context, selector) {
    Package.PanelNode.call(this, null, context, selector);
    this.factory = {
      'category': Package.CategoryNode,
      'file-action': Package.FileActionNode, // DEPRECATED
      'data-action': Package.DataActionNode,
      'item': Package.ActionNode
    };
  };

  var PanelMenu = Package.PanelMenu.prototype = js.lang.createMethods(
    Package.PanelNode
  );

  PanelMenu.registerType = function (name, klass) {
    return this.factory[name] = klass;
  };

  PanelMenu.createNode = function (data, context, selector) {
    var klass = this.factory[data.type];
    if (!klass) {
      throw 'Unsupported menu-data type: ' + data.type;
    }
    var node = new klass(data, context || this.context, selector || this.selector);
    node.addActionListener('onclick', function (action, node) {
      this.dispatchAction('onItemClick', node);
    }, this);
    return node;
  };

  /**
   * @class load
   *
   * @param data <Hash> Menu contents
   *
   *  items => @{
   *
   *    %{
   *      type => item
   *      action => doSomething:withMe
   *      text => Click Me
   *      icon => /path/to/icon.png
   *      tooltip => Click on this to doSomething
   *    }
   *
   *    %{
   *      type => category
   *      heading => More Entries
   *      items => @{
   *        # Same as items above (recursive)
   *      }
   *    }
   *
   *  }
   */

  PanelMenu.load = function (data) {
    this.data = data.name;
    Package.PanelNode.prototype.load.call(this, data.items);
  };

  PanelMenu.unload = function () {
    this.removeAllChildren();
  };

  PanelMenu.createUI = function () {
    this.dl = js.dom.createElement('DL.panel-menu');
  };

  PanelMenu.removeUI = function () {
    js.dom.removeElements(this.getElements());
  };

  PanelMenu.getElements = function () {
    return [this.dl];
  };

  PanelMenu.getAppendage = function () {
    return this.dl;
  };

});
