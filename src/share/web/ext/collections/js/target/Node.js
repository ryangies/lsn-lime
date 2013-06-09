/** @namespace {#namespace}.target */
js.extend('{#namespace}.target', function (js) {

  var _package = this;
  var CNodeBase = js.data.Node;
  var CDataListener = js.{#namespace}.target.DataListener;

  /**
   * @class Node
   */

  _package.Node = function (data) {
    CNodeBase.apply(this, arguments);
    CDataListener.apply(this);
  };

  var _proto = _package.Node.prototype = js.lang.createPrototype(
    CNodeBase,
    CDataListener
  );

  /**
   * @function createNode
   */

  _proto.createNode = function (data) {
    return new _package.Node(data);
  };

  /**
   * @function sortCompare
   */

  _proto.sortCompare = function (a, b) {
    if (!(js.util.defined(a) && js.util.defined(b))) return;
    var av = a.data.getIndex();
    var bv = b.data.getIndex();
    var rv = av - bv;
    return rv;
  };

  /** @function canDisplay */
  _proto.canDisplay = function () {
    return true;
  };

  /** @function getName */
  _proto.getName = function () {
    return this.data.getKey();
  };

  _proto.getType = function () {
    return this.data.getType();
  };

  _proto.getIconPath = function () {
    return this.data.getIcon();
  };

  _proto.getTargetAddress = function () {
    return this.data.getAddress();
  };

  _proto.getCrumbPath = function () {
    return this.getTargetAddress();
  };

});
