/** @namespace ext.sitemap.menu */
js.extend('ext.sitemap.menu', function (js) {

  var _package = this;
  var CActionNode = js.ext.share.ui.menu.ActionNode;

  _package.WebpageActionNode = function () {
    CActionNode.apply(this, arguments);
  };

  var _proto = _package.WebpageActionNode.prototype = js.lang.createMethods(
    CActionNode
  )

  _proto.canDisplay = function (target) {
    try {
      return target.data.data['.type'] == 'webpage';
    } catch (ex) {
      return false;
    }
  };

});
