/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;
  var CActionNode = Package.ActionNode;

  Package.DataActionNode = function (data, context, selector) {
    CActionNode.apply(this, arguments);
  };

  var DataActionNode
      = Package.DataActionNode.prototype
      = js.lang.createMethods(
    CActionNode
  );

  DataActionNode.canDisplay = function (node) {
    try {
      var type = node.getDataNode().getType();
      var matchTypes = this.data.matchTypes;
      var ok = false;
      for (var i = 0; !ok && i < matchTypes.length; i++) {
        ok = type.match(matchTypes[i]);
      }
      return ok ? true : false;
    } catch (ex) {
      return false;
    }
  };

});
