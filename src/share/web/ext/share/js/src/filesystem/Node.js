/** @namespace ext.share.filesystem */
js.extend('ext.share.filesystem', function (js) {

  var CDataNode = js.data.Node;

  /**
   * @class Node
   */

  var CNode = this.Node = function (data, tree) {
    CDataNode.apply(this);
    this.data = data;
    this.tree = tree;
    this.hasPopulated = false;
    this.alDataAction = this.data.addActionListener('*', this.onDataAction, this);
  };

  var _proto = this.Node.prototype = js.lang.createMethods(CDataNode);

  _proto.populate = function () {
    this.populateValues(this.data);
  };

  _proto.populateValues = function (data) {
    if (!(data && data.values) || this.hasPopulated) return;
    if (this.hasChildNodes()) {
      var values = data.values();
      for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var doInsert = true;
        var child = this.firstChild;
        while (child) {
          if (child.data === value) {
            doInsert = false;
            break;
          }
          child = child.nextSibling;
        }
        if (doInsert) this.insertChild(value);
      }
    } else {
      this.insertChildren(data.values());
    }
    this.hasPopulated = true;
  };

  _proto.populateChildren = function () {
    for (var node = this.firstChild; node; node = node.nextSibling) {
      node.populate();
    }
  };

  /**
   * @class getDataNode
   * Cross-class convention allowing callers to ignore the intermediaries when
   * fetching the underlying dnode.
   */

  _proto.getDataNode = function () {
    return this.data;
  };

  /**
   * @function getNodeByAddress
   * @param addr
   */

  _proto.getNodeByAddress = function (addr) {
    if (!js.util.defined(addr)) return;
    if (addr == this.data.getAddress()) return this;
    return this.walk(function (n) {
      var a = n.data.getAddress();
      if (addr.indexOf(a) != 0) {
        return this.CONTINUE;
      } else if (a == addr) {
        return n;
      }
    });
  };

  _proto.getNodeByData = function (data) {
    return this.walk(function (n) {
      if (n.data === data) return n;
    });
  };

  /**
   * @function createNode
   */

  _proto.createNode = function (data) {
    return new CNode(data, this.tree);
  };

  /**
   * @function sortCompare
   */

  _proto.sortCompare = function (a, b) {
    if (!(js.util.defined(a) && js.util.defined(b))) return;
    var result = b.data.isDirectory() - a.data.isDirectory();
    return result == 0
      ? a.data.getKey().localeCompare(b.data.getKey())
      : result;
  };

  /**
   * @function onDataAction
   * Triggers view updates when the model changes.
   */

  _proto.onDataAction = function (action, data) {
    var args = js.util.args(arguments);
    switch (action.name) {
      case 'create':
        this.insertChild(data);
        break;
      case 'usercreate':
        this.dispatchClassAction(action, this);
        break;
      case 'update':
        if (action.updated.order) {
          this.sort();
        }
        this.dispatchAction(action, this);
/*
        for (key in action.updated) {
          js.console.log('onUpdate:', node.getDataNode().getAddress(), key);
        }
*/
        break;
      case 'remove':
        if (data === this.getDataNode()) {
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
            this.tree.validateCwd();
          }
        }
        break;
      case 'status':
        this.dispatchAction(action, this, data);
        break;
      case 'fetch':
      case 'change':
      case 'store':
      case 'replace':
      default:
        if (false) { // DEBUG
          var addr = data && js.util.isFunction(data.getAddress)
            ? data.getAddress()
            : undefined;
          js.console.log('unhandled action "' + action.name + '" for: ' + addr);
        }
    }
  };

  _proto.setAsCwd = function () {
    this.loadChildren();
    this.tree.setCwd(this);
  };

  _proto.expand = function () {
    if (this.canExpand() && !this.isExpanded) {
      this.loadChildren([function (data) {
        this.isExpanded = true;
        this.dispatchAction('onExpand', this);
      }, this]);
    }
  };

  _proto.loadChildren = function (cb) {
    this.populateChildren();
    this.data.reload(cb);
  };

  _proto.collapse = function () {
    if (this.canCollapse() && this.isExpanded) {
      this.dispatchAction('onCollapse', this);
      this.isExpanded = false;
    }
  };

  _proto.toggleExpanded = function () {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };

  _proto.select = function () {
    this.tree.select(this);
  };

  _proto.deselect = function () {
    this.tree.deselect(this);
  };

  _proto.isSelected = function () {
    var me = this;
    function matchFunction (unk) {return unk === me;}
    return js.util.grep(matchFunction, this.tree.getSelection());
  };

  _proto.canDisplay = function () {
    return true;
  };

  _proto.canExpand = function () {
    return this.data.isDirectory();
  };

  _proto.canCollapse = function () {
    return this.parentNode ? true : false;
  };

  _proto.getName = function () {
    return this.data.getKey() || this.data.getAddress();
  };

  _proto.getType = function () {
    return this.data.getType();
  };

  _proto.getIconPath = function () {
    return this.data.getIcon();
  };

  _proto.getCrumbPath = function () {
    return this.getTargetAddress();
  };

  _proto.getTargetAddress = function () {
    return this.data.getAddress();
  };

});
