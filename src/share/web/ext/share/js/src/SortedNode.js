/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var _package = this;
  var _base = js.data.Node;
  var _super = _base.prototype;
  var _proto = js.lang.createMethods(_base);

  /**
   * @class SortedNode
   */

  _package.SortedNode = function () {
    _base.apply(this, arguments);
  };

  _package.SortedNode.prototype = _proto;

  _proto.sortCompare = function (a, b) {
    if (a && b) {
      var av = a.data.sortValue || 0;
      var bv = b.data.sortValue || 0;
      var rv = av - bv;
      return rv == 0
        ? a.index = b.index
        : rv;
    } else {
      return a ? -1 : b ? 1 : 0;
    }
  };

});
