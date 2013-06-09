/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var _package = this;
  var CNodeBase = js.data.Node;
  var CSelectable = js.ext.share.data.model.Selectable;
  var CDataListener = js.ext.share.data.model.DataListener;

  /**
   * @class Node
   */

  _package.Node = function (data) {
    CNodeBase.apply(this, arguments);
    CSelectable.apply(this);
    CDataListener.apply(this);
    this.populate();
  };

  var _proto = _package.Node.prototype = js.lang.createPrototype(
    CNodeBase,
    CSelectable,
    CDataListener
  );

  /**
   * @function populate
   */

  _proto.populate = function () {
    if (this.data && js.util.isFunction(this.data.values)) {
      var items = this.data.values();
      for (var i = 0, item; item = items[i]; i++) {
        this.insertChild(item);
      }
    }
  };

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

  /**
   * @class canDisplay
   */

  _proto.canDisplay = function () {
    return true;
  };

  /**
   * @class getName
   */

  _proto.getName = function () {
    return this.data.getKey();
  };

  /**
   * @class getType
   */

  _proto.getType = function () {
    return this.data.getType();
  };

});
