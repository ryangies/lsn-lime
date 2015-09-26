js.extend('{#namespace}.view', function (js) {

  var CBaseCrumbView = js.ext.share.filesystem.view.CrumbView;
  var CBaseCrumbViewLayer = js.ext.share.filesystem.view.CrumbView.prototype.Layer;

  /**
   * @class CrumbView
   */

  this.CrumbView = function (name, tree) {
    CBaseCrumbView.apply(this, arguments);
  };

  var CrumbView = this.CrumbView.prototype = js.lang.createMethods(
    CBaseCrumbView
  );

  /**
   * @class CrumbView.Layer
   */

  CrumbView.Layer = function (node, name, view) {
    CBaseCrumbViewLayer.apply(this, arguments);
  };

  var Layer = CrumbView.Layer.prototype = js.lang.createMethods(
    CBaseCrumbViewLayer
  );

  Layer.extendUI = function () {
    try {
      this.svName = this.node.getName();
      this.svName.tie(this.uiName, ['innerHTML']);
    } catch (ex) {
      js.console.log("Could not get name from node:", this.node);
    }
  };

  Layer.updateUI = function () {
    var addr = this.node.getTargetAddress();
    js.dom.setAttribute(this.uiAnchor, 'href', addr);
    js.dom.setAttribute(this.uiAnchor, 'title', addr);
    js.dom.setAttribute(this.uiIcon, 'src', this.node.getIconPath());
  };

  Layer.onClick = function (event) {
    CBaseCrumbViewLayer.prototype.onClick.apply(this, arguments);
    this.node.select();
  }

});
