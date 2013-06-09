js.extend('lsn.hashtable.model', function (js) {

  var CNode = js.data.Node;
  var CAction = js.action.ActionDispatcher;

  this.Item = function (dnode) {
    CAction.apply(this);
    var data = {
      attributes: {
      },
      values: {},
      dnode: dnode
    };
    CNode.apply(this, [data]);
    dnode.iterate(function (key, value) {
      data.values[key] = value.toString();
      value.addActionListener('change', this.doDataChanged, this);
    }, this);
  };

  var Item = this.Item.prototype = js.lang.createMethods(
    CAction,
    CNode
  );

  Item.unload = function () {
    this.data.dnode.iterate(function (key, value) {
      value.removeActionListener('change', this.doDataChanged, this);
    }, this);
  };

  Item.doDataChanged = function (action, node) {
    var key = node.getKey();
    this.data.values[key] = node.getValue();
    this.dispatchAction('change', this);
  };

  Item.reset = function () {
    this.data.dnode.iterate(function (key, value) {
      this.data.values[key] = value;
    }, this);
  };

  Item.select = function () {
    this.executeAction('select', this);
  };

  Item.deselect = function () {
    this.executeAction('deselect', this);
  };

  Item.getAttribute = function (name) {
    return this.data.attributes[name];
  };

  Item.setAttribute = function (name, value) {
    return this.data.attributes[name] = value;
  };

  Item.removeAttribute = function (name) {
    delete this.data.attributes[name];
  };

  Item.getDataNode = function () {
    return this.data.dnode;
  };

  Item.getValue = function (key) {
    return this.data.values[key];
  };

  Item.setValue = function (key, value) {
    return this.data.values[key] = value;
  };

  Item.getKey = function () {
    return this.data.dnode.getKey();
  };

  Item.getDisplayField = function () {
    return this.data.dnode.getValue(this.rootNode.meta.name_field);
  };

  Item.getDisplayName = function () {
    var field = this.getDisplayField();
    return field ? field.toString() : this.getKey();
  };

  Item.lower = function () {
    if (this.parentNode && this.previousSibling) {
      this.parentNode.insertBefore(this, this.previousSibling);
      this.dispatchAction('lower');
    }
  };

  Item.raise = function () {
    if (this.parentNode && this.nextSibling) {
      this.parentNode.insertAfter(this, this.nextSibling);
      this.dispatchAction('raise');
    }
  };

  Item.isModified = function () {
    for (var key in this.data.values) {
      var myValue = this.data.values[key];
      var dbValue = this.data.dnode.getString(key);
      //js.console.log('isModified ' + key + ': ', myValue, dbValue);
      if (myValue != dbValue) return true;
    }
    return false;
  };

  Item.store = function (commands) {
    commands.push(['store', this.getDataNode().getAddress(), this.data.values]);
  };

  Item.remove = function () {
    this.parentNode.removeChild(this);
    this.dispatchAction('remove', this);
  };

});
