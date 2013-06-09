/** @namespace ext.share.data.view */
js.extend('ext.share.data.view', function (js) {

  var _package = this;
  CBaseView = js.ext.share.ui.View;
  CNodeLayer = js.data.NodeLayer;

  _package.ListViewItem = function (mnode, layerName, view) {
    CNodeLayer.apply(this, arguments);
    CBaseView.apply(this);
    this.view = view;
  };

  _proto
      = _package.ListViewItem.prototype
      = js.lang.createPrototype(CBaseView, CNodeLayer);

  _proto.createElements = function () {
    this.dnode = this.node.getDataNode();
    return [js.dom.createElement('P=' + this.dnode.toString())];
  };

  _proto.onAdopted = function () {
    CNodeLayer.prototype.onAdopted.apply(this, arguments);
    this.node.addActionListener('onSelect', this.onModelSelect, this);
    this.node.addActionListener('onDeselect', this.onModelDeselect, this);
    this.insertElements();
  };

  _proto.onOrphaned = function () {
    CNodeLayer.prototype.onOrphaned.apply(this, arguments);
    this.node.removeActionListener('onSelect', this.onModelSelect, this);
    this.node.removeActionListener('onDeselect', this.onModelDeselect, this);
    this.removeElements();
  };

  _proto.onReordered = function () {
    CNodeLayer.prototype.onReordered.apply(this, arguments);
    this.insertElements();
  };

  _proto.insertElements = function () {
    if (this.nextSibling) {
      var nextElements = this.nextSibling.getElements();
      var nextElement = nextElements[0];
      js.dom.insertChildrenBefore(nextElement, this.getElements());
    } else if (this.previousSibling) {
      var previousElements = this.previousSibling.getElements();
      var previousElement = previousElements[previousElements.length - 1];
      js.dom.insertChildrenAfter(previousElement, this.getElements());
    } else {
      js.dom.appendChildren(this.view.getAppendage(), this.getElements());
    }
  };

  _proto.onModelSelect = function (action, node) {
    js.dom.addClassName(this.getElements(), 'selected');
  };

  _proto.onModelDeselect = function (action, node) {
    js.dom.removeClassName(this.getElements(), 'selected');
  };

});
