/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var _package = this;

  /**
   * @class DataListener
   */

  _package.DataListener = function () {
    this.dataListeners = this.als || [];
    this.addActionListener('onAdopted', this.attachDataListener, this);
    this.addActionListener('onOrphaned', this.detachDataListener, this);
  };

  var _proto = _package.DataListener.prototype = js.lang.createMethods(
  );

  /**
   * @function detachDataListener
   */

  _proto.detachDataListener = function () {
    for (var i = 0, al; al = this.dataListeners[i]; i++) {
      al.remove();
    }
    this.dataListeners = [];
  };

  /**
   * @function attachDataListener
   * We capture data events which pertain to the adding, removing, and ordering
   * of items.
   */

  _proto.attachDataListener = function () {
    this.dataListeners.push(
      this.data.addActionListener('create', this.onDataAction, this),
      this.data.addActionListener('update', this.onDataAction, this),
      this.data.addActionListener('remove', this.onDataAction, this)
    );
  };

  /**
   * @function onDataAction
   */

  _proto.onDataAction = function (action, dnode) {
    switch (action.name) {
      case 'create':
        try {
          this.insertChild(dnode);
        } catch (ex) {
          js.error.reportError(ex);
        }
        break;
      case 'update':
        if (action.updated.order) {
          this.sort();
        }
        this.dispatchAction(action, dnode);
        break;
      case 'remove':
        if (dnode === this.getDataNode()) {
          this.deselect();
          this.parentNode.removeChild(this);
        }
        break;
    }
  };

});
