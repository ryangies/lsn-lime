/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var CBaseView = js.ext.share.ui.View;

  this.SummaryView = function (tree, schema) {
    CBaseView.apply(this);
    this.layerName = '{#screen/id}-summary-view' + '-' + schema.getId();
    this.action = '{#screen/id}-edit-item';
    this.rootLayer = null;
    this.model = tree.rootNode;
    this.schema = schema;
    this.model.addLayer(this.layerName, this);
    this.createHeaders();
  };

  var _proto = this.SummaryView.prototype = js.lang.createMethods(
    CBaseView
  );

  _proto.unload = function () {
    this.model.removeLayer(this.layerName);
    this.rootLayer = null;
    CBaseView.prototype.unload.call(this);
  };

  _proto.onPopulationChange = function (action, layerNode) {
    js.dom.toggleClassName( this.table, 'empty',
        !(this.rootLayer && this.rootLayer.hasChildNodes()));
  };

  _proto.createLayer = function (node, name) {
    if (node === this.model) {
      this.rootLayer = new js.data.NodeLayer(node, name);
      this.rootLayer.addActionListener('onAdopt', this.onPopulationChange, this);
      this.rootLayer.addActionListener('onOrphan', this.onPopulationChange, this);
      return this.rootLayer;
    }
    if (node.canDisplay()) {
      try {
        if (node.getSchema().getId() == this.schema.getId()) {
          return new js.{#namespace}.view.SummaryViewItem(node, name, this);
        }
      } catch (ex) {
        js.console.log('Could not create item', name);
      }
    }
  };

  _proto.createElements = function () {
    this.tbody = js.dom.createElement('TBODY');
    this.thead = js.dom.createElement('THEAD');
    this.table = js.dom.createElement('TABLE.tree-list-view.empty', [
      this.thead,
      this.tbody
    ]);
    return [this.table];
  };

  _proto.getSchema = function () {
    return this.schema;
  };

  _proto.createHeaders = function () {
    var headers = [];
    headers.push(js.dom.createElement('TH.icon'));
    var fields = this.schema.getSummaryFields();
    for (var i = 0, field; field = fields[i]; i++) {
      headers.push(js.dom.createElement('TH=' + field.getLabelText()));
    }
    js.dom.appendChild(this.thead, js.dom.createElement('TR', headers));
  };

  _proto.getAppendage = function () {
    return this.tbody;
  };

  _proto.getAction = function () {
    return this.action;
  };

  _proto.setAction = function (action) {
    return this.action = action;
  };

});
