js.extend('ext.filesystem.view', function (js) {

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
    var headers = this.super.createHeaders.call(this);
    return headers.concat(js.dom.createElements(
      'TH.detail.size=Size',
      'TH.detail.date=Date',
      'TH.detail.time=Time',
      'TH.detail.type=Type'
    ));
  };

  /**
   * @class ListView.Layer
   */

  var BaseListViewLayer = BaseListView.prototype.Layer;

  ListView.Layer = function (node, name, view) {
    this.super = BaseListViewLayer.prototype;
    BaseListViewLayer.apply(this, arguments);
    this.action = 'fs-open';
  };

  var Layer = ListView.Layer.prototype = js.lang.createMethods(
    BaseListViewLayer
  );

  Layer.createColumns = function () {
    var cols1 = this.super.createColumns.call(this);
    var cols2 = [
      this.tdSize = js.dom.createElement('TD.detail.size'),
      this.tdDate = js.dom.createElement('TD.detail.date'),
      this.tdTime = js.dom.createElement('TD.detail.time'),
      this.tdType = js.dom.createElement('TD.detail.type')
    ];
    return cols1.concat(cols2);
  };

  Layer.updateUI = function () {
    this.super.updateUI.call(this);
    var data = this.node.data;
    this.tdSize.innerHTML = data.getFilesize();
    this.tdDate.innerHTML = js.date.format(data.getDate(), 'mediumDate');
    this.tdTime.innerHTML = js.date.format(data.getDate(), 'shortTime');
    this.tdType.innerHTML = data.getType();
  };

  Layer.onStatus = function (action, node, stats) {
    this.super.onStatus.apply(this, arguments);
    this.updateUI();
    var percent = stats.percent || 0;
    this.tdSize.innerHTML = percent + '%';
  };

});
