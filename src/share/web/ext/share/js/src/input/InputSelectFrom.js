/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;
  var CListView = js.ext.share.data.view.ListView;
  var CListViewItem = js.ext.share.data.view.ListViewItem;
  var CParameters = js.impl.Parameters;

  /**
   * CSelect
   */

  function CSelect (params) {
    CParameters.call(this, {'displayField': 'name'});
    CListView.call(this);
    this.overlayParameters(params);
  };

  var Select = CSelect.prototype = js.lang.createPrototype(
    CParameters,
    CListView
  );

  Select.createElements = function () {
    return js.dom.createElements('SELECT', [
      'OPTION', {
        'value': '',
        'innerHTML': ''
      }
    ]);
  };

  Select.createLayer = function (mnode, layerName) {
    if (!mnode.getDataNode().isDataContainer()) return;
    var layerClass = mnode === this.model
      ? js.data.NodeLayer
      : this.getItemClass()
    return new layerClass(mnode, layerName, this);
  };

  /**
   * COption
   */

  function COption () {
    CListViewItem.apply(this, arguments);
    this.displayDatum = null;
  };

  var Option = COption.prototype = js.lang.createPrototype(
    CListViewItem
  );

  Option.getDisplayText = function () {
    return this.displayDatum ? this.displayDatum.toString() : '';
  };

  Option.createElements = function () {
    return js.dom.createElements('OPTION');
  };

  Option.onAdopted = function () {
    var k = this.view.getParameter('displayField') || 'name';
    var elt = this.getElements()[0];
    js.dom.setAttribute(elt, 'value', this.node.id);
    this.displayDatum = this.getDataNode().getValue(k);
    if (this.displayDatum) {
      this.displayDatum.tie(elt, ['innerHTML']);
    } else {
      js.dom.setValue(elt, '!Missing target field: ' + k);
    }
    CListViewItem.prototype.onAdopted.apply(this, arguments);
  };

  Option.onOrphaned = function () {
    CListViewItem.prototype.onOrphaned.apply(this, arguments);
  };

  /**
   * @class InputSelectFrom
   */

  _package.InputSelectFrom = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = null;
    this.widget = new CSelect(params);
    this.widget.setItemClass(COption);
    this.widget.setLayerName('select-from');
    this.load();
  };

  var _proto = _package.InputSelectFrom.prototype = js.lang.createMethods(CInputBase);

  _package.factory.set('select-from', _package.InputSelectFrom);

  _proto.createElements = function () {
    this.uiSelect = this.widget.getElements()[0];
    var paramSize = this.getParameter('size');
    if (paramSize) {
      js.dom.setAttribute(this.uiSelect, 'size', paramSize);
    }
    return [this.attach(this.uiSelect)];
  };

  _proto.getValueText = function () {
    try {
      var option = this.value.getLayer(this.widget.getLayerName());
      return option.getDisplayText();
    } catch (ex) {
      return '';
    }
  };

  _proto.marshal = function (dataValue) {
    var ctrlValue = dataValue ? dataValue.id : '';
    return ctrlValue;
  };

  _proto.unmarshal = function (ctrlValue) {
    try {
      var value = null;
      this.widget.getModel().walk(function (mnode) {
        if (mnode.id == ctrlValue) {
          value = mnode;
          return this.BREAK;
        }
      });
      return value;
    } catch (ex) {
      return this.emptyValue;
    }
  };

  _proto.deserialize = function (storedValue) {
    var value = this.emptyValue;
    try {
      this.widget.getModel().walk(function (mnode) {
        if (mnode.getDataNode().getAddress() == storedValue) {
          value = mnode;
          return this.BREAK;
        }
      });
    } catch (ex) {
    }
    this.setValue(value);
    return this;
  };

  _proto.serialize = function () {
    try {
      return this.getValue().getDataNode().getAddress();
    } catch (ex) {
      return '';
    }
  };

  _proto.load = function () {
    var ds = this.getParameter('dataSource') || this.getParameter('options');
    if (!ds) return;
    env.hub.get(ds, [this.onLoad, this]);
  };

  _proto.onLoad = function (dnode) {
    if (!dnode) throw new Error('InputSelectFrom: Cannot load data source');
    this.widget.load(dnode);
    // Rewrite the value now that the options are present (caller may setValue 
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

});
