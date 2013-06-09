/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;

  /**
   * @class CategoryNode
   */

  Package.CategoryNode = function CCategoryNode (data, context, selector) {
    Package.PanelNode.apply(this, arguments);
  };

  var CategoryNode = Package.CategoryNode.prototype = js.lang.createMethods(
    Package.PanelNode
  );

  CategoryNode.createUI = function () {
    this.ol = js.dom.createElement('OL.action-menu');
    this.dt = js.dom.createElement('DT=' + this.data.heading);
    this.dd = js.dom.createElement('DD', [this.ol]);
  };

  CategoryNode.getElements = function () {
    return this.data.heading ? [this.dt, this.dd] : [this.dd];
  };

  CategoryNode.getAppendage = function () {
    return this.ol;
  };

  CategoryNode.canDisplay = function (target) {
    try {
      for (var child = this.firstChild; child; child = child.nextSibling) {
        if (child.canDisplay(target)) return true;
      }
    } catch (ex) {
      return false;
    }
    return false;
  };

});
