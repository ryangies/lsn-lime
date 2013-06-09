/** @namespace ext.share.filesystem.view */
js.extend('ext.share.filesystem.view', function (js) {

  var CTreeView = js.ext.share.filesystem.view.TreeView;

  /**
   * @class SelectView
   */

  this.SelectView = function (name, tree) {
    this.div = js.dom.createElement('DIV.' + name + '.select-view');
    CTreeView.apply(this, arguments);
  };

  var _proto = this.SelectView.prototype = js.lang.createMethods(
    CTreeView
  );

  _proto.getElements = function () {
    return [this.div];
  };

  _proto.Layer = js.ext.share.filesystem.view.SelectViewLayer;

});
