/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;
  var CActionNode = Package.ActionNode;
  var CInitiator = js.ext.share.Initiator;

  Package.FileActionNode = function (data, context, selector) {
    if (!js.util.isa(data, CInitiator)) {
      data = new CInitiator(data);
    }
    CActionNode.apply(this, arguments);
  };

  var FileActionNode
      = Package.FileActionNode.prototype
      = js.lang.createMethods(
    CActionNode
  );

  FileActionNode.canDisplay = function (node) {
    try {
      return this.data.match(node);
    } catch (ex) {
      return false;
    }
  };

});
