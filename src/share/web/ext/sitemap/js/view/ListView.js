js.extend('ext.sitemap.view', function (js) {

  var _package = this;
  var BaseListView = js.ext.share.filesystem.view.ListView;

  /**
   * @class ListView
   */

  _package.ListView = function (name, tree) {
    this.super = BaseListView.prototype;
    BaseListView.apply(this, arguments);
  };

  var ListView = _package.ListView.prototype = js.lang.createMethods(
    BaseListView
  );

  ListView.createHeaders = function () {
    return js.dom.createElements(
      'TH.icon',
      'TH.name=Name',
      'TH=Location'
    );
  };

  /**
   * @class ListView.Layer
   */

  var BaseListViewLayer = BaseListView.prototype.Layer;

  ListView.Layer = function (node, name, view) {
    this.super = BaseListViewLayer.prototype;
    BaseListViewLayer.apply(this, arguments);
    this.action = 'ext-sitemap-expand';
  };

  var Layer = ListView.Layer.prototype = js.lang.createMethods(
    BaseListViewLayer
  );

  Layer.createColumns = function () {
    var cols1 = this.super.createColumns.call(this);
    var cols2 = js.dom.createElements(
      this.tdAddr = js.dom.createElement('TD.addr.w50')
    );
    return cols1.concat(cols2);
  };

  Layer.extendUI = function () {
    this.uiAddr = js.dom.createElement('SPAN.addr');
    js.dom.replaceChildren(this.tdAddr, [this.uiAddr]);
    // Tied values are updated when data changes
    this.svName = this.node.data.getValue('.name');
    this.svAddr = this.node.data.getValue('.addr');
    this.svName.tie(this.nameStatic, ['innerHTML']);
    this.svName.tie(this.nameLinked, ['innerHTML']);
    if (this.svAddr) {
      this.svAddr.tie(this.uiAddr, ['innerHTML']);
    }
  };

  Layer.updateUI = function () {
    // Do not call base class, we set name and icon here
    var addr = this.node.getTargetAddress();
    js.dom.setAttribute(this.nameLinked, 'href', addr);
    js.dom.setAttribute(this.nameLinked, 'title', addr);
    js.dom.setAttribute(this.uiIcon, 'src', this.node.getIconPath());
    if (!this.svAddr) {
      js.dom.setValue(this.uiAddr, addr);
    }
  };

});
