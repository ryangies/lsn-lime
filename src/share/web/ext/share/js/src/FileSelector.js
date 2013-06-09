/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var _package = this;
  var _base = js.action.ActionDispatcher;
  var _proto = js.lang.createMethods(_base);

  /**
   * @class FileSelector
   * This class mirrors the switchlist, providing selection for their 
   * underlying files.
   */

  _package.FileSelector = function (switchlist) {
    _base.apply(this);
    this.node = new js.data.Node(); // wrapper node
    switchlist.addActionListener('onAdd', this.onAdd, this);
    switchlist.addActionListener('onRemove', this.onRemove, this);
  };

  _package.FileSelector.prototype = _proto;

  _proto.onAdd = function (action, switchable) {
    switchable.addActionListener('onReady', this.doSelect, this);
    switchable.addActionListener('onHide', this.doDeselect, this);
  };

  _proto.onRemove = function (action, switchable) {
    if (this.node.data && this.node.data === switchable.getDataNode()) {
      this.node.data = null;
    }
  };

  _proto.doSelect = function (action, switchable) {
    this.node.data = switchable.getDataNode();
    this.executeAction('onSelect', this.node);
  };

  _proto.doDeselect = function (action, switchable) {
    this.executeAction('onDeselect', this.node);
    this.node.data = null;
  };

  _proto.getSelected = function () {
    return this.node; // selections expect dnode's wrapped in a node
  };

});
