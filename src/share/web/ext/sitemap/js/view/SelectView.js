/** @namespace ext.sitemap.view */
js.extend('ext.sitemap.view', function (js) {

  var CSelectView = js.ext.share.filesystem.view.SelectView;
  var CSelectViewLayer = js.ext.share.filesystem.view.SelectViewLayer;

  /**
   * @class SelectView
   */

  this.SelectView = function (name, tree) {
    CSelectView.apply(this, arguments);
  };

  var _proto = this.SelectView.prototype = js.lang.createMethods(
    CSelectView
  );

  /**
   * @subclass Layer
   */

  _proto.Layer = function (node, name, view) {
    CSelectViewLayer.apply(this, arguments);
  };

  var Layer = _proto.Layer.prototype = js.lang.createMethods(
    CSelectViewLayer
  );

});
