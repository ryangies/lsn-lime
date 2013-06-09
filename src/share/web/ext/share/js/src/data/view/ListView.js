/** @namespace ext.share.data.view */
js.extend('ext.share.data.view', function (js) {

  var _package = this;
  CBaseView = js.ext.share.ui.View;
  CListViewItem = js.ext.share.data.view.ListViewItem;

  _package.ListView = function (itemClass) {
    CBaseView.apply(this);
    this.itemClass = null;
    this.layerName = null;
  };

  _proto
      = _package.ListView.prototype
      = js.lang.createPrototype(CBaseView);

  _proto.setItemClass = function (itemClass) {
    return this.itemClass = itemClass;
  };

  _proto.getItemClass = function () {
    return this.itemClass || CListViewItem;
  };

  _proto.setLayerName = function (layerName) {
    if (this.layerName) {
      js.dom.removeClassName(this.getElements(), this.layerName);
    }
    this.layerName = layerName;
    layerName = this.getLayerName();
    js.dom.addClassName(this.getElements(), layerName);
    return layerName;
  };

  _proto.getLayerName = function () {
    return this.layerName
      ? this.layerName
      : this.setLayerName('layer-' + js.util.rand4());
  };

  _proto.load = function (data) {
    this.model = new js.ext.share.data.model.RootNode(data);
    this.model.attachDataListener();
    this.model.addLayer(this.getLayerName(), this);
    return this.model;
  };

  _proto.getModel = function () {
    return this.model;
  };

  _proto.createLayer = function (mnode, layerName) {
    var layerClass = mnode === this.model
      ? js.data.NodeLayer
      : this.getItemClass()
    return new layerClass(mnode, layerName, this);
  };

  _proto.createElements = function () {
    return [js.dom.createElement('DIV.list-view')];
  };

  _proto.getAppendage = function () {
    return this.getElements()[0];
  };

  _proto.unload = function () {
    CBaseView.prototype.unload.apply(this);
    this.model.removeLayer(this.getLayerName());
  };

});
