/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var CNodeBase = js.ext.share.data.model.Node;
  var CSelection = js.ext.share.Selection;

  /**
   * @class RootNode
   */

  this.RootNode = function (data) {
    CNodeBase.call(this, data);
    CSelection.call(this);
  };

  var _proto = this.RootNode.prototype = js.lang.createMethods(
    CNodeBase,
    CSelection
  );

  _proto.load = function (ds) {
    env.hub.get(ds, [this.onLoad, this]);
  };

  _proto.onLoad = function (dnode) {
    this.data = dnode;
    this.populate();
  };

});
