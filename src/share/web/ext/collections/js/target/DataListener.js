/** @namespace {#namespace}.target */
js.extend('{#namespace}.target', function (js) {

  var _package = this;

  /**
   * @class DataListener
   */

  _package.DataListener = function (selection) {
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
   */

  _proto.attachDataListener = function () {
    var al = this.data.addActionListener('*', this.onDataAction, this);
    this.dataListeners.push(al);
  };

  /**
   * @function onDataAction
   */

  _proto.onDataAction = function (action, dnode) {
    var args = js.util.args(arguments);
    /*
    var myAddr = this.getDataNode().getAddress();
    var addr = dnode ? dnode.getAddress() : null;
    js.console.log(myAddr, 'onDataAction', action.name, addr);
    */
    switch (action.name) {
      case 'create':
        try {
          this.insertChild(dnode);
        } catch (ex) {
          // No node created
        }
        break;
      case 'usercreate':
        this.select();
        break;
      case 'update':
        if (action.updated.order) {
          this.sort();
        }
        this.dispatchAction(action, dnode);
        break;
      case 'remove':
        if (dnode === this.getDataNode()) {
          try {
            if (this.isSelected()) {
              var newSelection = this.nextSibling || this.previousSibling;
              if (newSelection) {
                newSelection.select();
              } else {
                this.deselect();
              }
            }
          } catch (ex) {
            js.error.reportError(ex);
          } finally {
            this.parentNode.removeChild(this);
          }
        }
        /*
        var node = this.getNodeByData(dnode);
        if (node) {
          node.deselect();
          node.parentNode.removeChild(node);
        }
        */
        break;
      case 'change':
        // TODO, Each cell should be tied with its own listener on the corresponding
        // ScalarNode. This updates the whole row when child data is changed.
        this.dispatchAction('onUpdate', this);
        break;
    }
  };

});
