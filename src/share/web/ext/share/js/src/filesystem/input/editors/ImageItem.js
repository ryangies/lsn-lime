/** @namespace ext.share.filesystem.input.editors */
js.extend('ext.share.filesystem.input.editors', function (js) {

  var _package = this;
  var CBaseView = js.ext.share.data.view.ListViewItem;

  _package.ImageItem = function (mnode, name, view) {
    CBaseView.apply(this, arguments);
    this.als = [
      this.getDataNode().addActionListener('change', this.onDataChange, this)
    ];
    this.updateElements();
  };

  var _proto
    = _package.ImageItem.prototype
    = js.lang.createPrototype(CBaseView);

  _proto.createElements = function () {
    this.uiImage = js.dom.createElement('IMG.image-item.' + this.layerName, {
      'onClick': [this.onClick, this]
    });
    return [this.uiImage];
  };

  _proto.updateElements = function () {
    var src = this.getDataNode().toString();
    var url = new js.http.Location(src);
    url.addParameter('resize', '50x50');
    js.dom.setAttribute(this.uiImage, 'src', url.getHref());
  };

  _proto.onDataChange = function (action, dnode) {
    this.updateElements();
  };

  _proto.onClick = function (event) {
    js.dom.stopEvent(event);
    this.node.select();
  };

});
