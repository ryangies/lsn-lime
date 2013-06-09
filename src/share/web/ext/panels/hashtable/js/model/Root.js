js.extend('lsn.hashtable.model', function (js) {

  var CNode = js.data.Node;
  var CAction = js.action.ActionDispatcher;
  var _schemaKey = '.schema';

  this.Root = function () {
    CNode.apply(this);
    CAction.apply(this);
    this.meta = null;
    this.db = env.hub;
    this.selected = null;
    this.indexOffset = 0;
    this.targetAddress = null;
    this.dataAddress = null;
    this.dataRoot = null;
    this.als = [];
  };

  var Root = this.Root.prototype = js.lang.createMethods(
    CNode,
    CAction
  );

  Root.createNode = function (dnode) {
    var node = new js.lsn.hashtable.model.Item(dnode);
    node.addActionListener('select', this.doSelect, this);
    node.addActionListener('deselect', this.doDeselect, this);
    node.addActionListener('raise', this.incrementOffset, this);
    node.addActionListener('lower', this.decrementOffset, this);
    return node;
  };

  Root.load = function (targetAddress, defaultSchemaAddress) {
    this.db.fetch(targetAddress, [this.onLoad, this, [defaultSchemaAddress]]);
  };

  Root.onLoad = function (dnode, defaultSchemaAddress) {
    try {
      if (dnode.getType() === 'directory') {
        // There is no open way to preserve order of a directory listing
        throw 'Editing a directory of hash files is not supported';
      }
      this.targetAddress = dnode.getAddress();
      this.target = dnode;
      this.db.fetch(js.data.addr_join(this.targetAddress, _schemaKey), 
        [this.onLoadSchema, this, [defaultSchemaAddress]]);
    } catch (ex) {
      this.loadComplete(ex);
    }
  };

  Root.onLoadSchema = function (dnode, defaultSchemaAddress) {
    try {
      if (!dnode) {
        if (defaultSchemaAddress) {
          this.db.fetch(defaultSchemaAddress, [this.onLoadSchema, this]);
          return;
        }
      }
      if (dnode.getType() == 'data-scalar') {
        this.db.fetch(dnode.toString(), [this.onLoadSchema, this]);
        return;
      }
      this.schemaAddress = dnode.getAddress();
      this.meta = dnode.toObject();
      if (this.meta.root_subkey) {
        this.dataAddress = js.data.addr_join(this.targetAddress, 
          this.meta.root_subkey);
        this.db.fetch(this.dataAddress, [this.onLoadRoot, this]);
      } else {
        this.onLoadRoot(this.target);
      }
    } catch (ex) {
      this.loadComplete(ex);
    }
  };

  Root.onLoadRoot = function (dnode) {
    try {
      this.dataRoot = dnode;
      this.dataAddress = dnode.getAddress();
      this.dataRoot.iterate(function (name, dnode) {
        if (name === _schemaKey) return;
        this.appendChild(dnode);
      }, this);
      this.als.push(dnode.addActionListener('create', this.onAddNode, this));
      this.als.push(dnode.addActionListener('remove', this.onRemoveNode, this));
      this.loadComplete();
    } catch (ex) {
      this.loadComplete(ex);
    }
  };

  Root.loadComplete = function (ex) {
    if (ex) {
      this.dispatchAction('loadError', ex);
    } else {
      this.dispatchAction('load', this);
    }
  };

  Root.createNewKey = function () {
    return this.dataRoot.getType() == 'data-array'
      ? '<next>'
      : js.util.randomId();
  };

  Root.fetchNewNode = function () {
    var name = this.createNewKey();
    var toAddress = js.data.addr_join(this.dataAddress, name);
    var newItem = this.meta.new_item;
    var fromAddress = typeof(newItem) === 'string'
      ? newItem.indexOf('/') == 0
        ? newItem
        : js.data.addr_join(this.schemaAddress, newItem)
      : js.data.addr_join(this.schemaAddress, 'new_item');
    this.db.copy(fromAddress, toAddress, [this.onFetchNewNode, this, [name]]);
  };

  Root.onFetchNewNode = function (result, name) {
    if (this.hasChildNodes()) {
      var dnode = name === '<next>'
        ? result.getValue(result.length - 1)
        : result.getValue(name);
      var node = this.lastChild;
      while (node) {
        if (node.getDataNode() === dnode) {
          node.select();
          break;
        }
        node = node.previousSibling;
      }
    }
  };

  Root.onAdopt = function (node) {
    this.executeAction('create', node);
  };

  Root.onOrphan = function (node) {
    this.executeAction('remove', node);
  };

  Root.onAddNode = function (action, dnode) {
    this.appendChild(dnode);
  };

  Root.onRemoveNode = function (action, dnode) {
    var node = this.firstChild;
    while (node) {
      if (node.getDataNode() === dnode) {
        this.removeChild(node);
        break;
      }
      node = node.nextSibling;
    }
  };

  Root.doSelect = function (action, node) {
    if (this.selected) this.selected.deselect();
    this.selected = node;
    this.executeAction('select', node);
  };

  Root.doDeselect = function (action, node) {
    this.reset();
    this.selected = null;
    this.executeAction('deselect', node);
  };

  Root.getSelected = function () {
    return this.selected;
  };

  Root.decrementOffset = function () {
    this.indexOffset--;
  };

  Root.incrementOffset = function () {
    this.indexOffset++;
  };

  Root.reset = function () {
    var l = this.indexOffset;
    for (var i = 0; i > l; i--) {
      this.selected.raise();
    }
    for (var i = 0; i < l; i++) {
      this.selected.lower();
    }
    if (this.selected) this.selected.reset();
  };

  Root.isModified = function () {
    if (this.indexOffset != 0) return true;
    if (this.selected) return this.selected.isModified();
  };

  Root.store = function (cb) {
    var commands = [];
    if (this.selected && this.selected.isModified()) this.selected.store(commands);
    // Reorder must occur AFTER store command
    if (this.indexOffset != 0) {
      var indexes = [];
      for (var node = this.firstChild; node; node = node.nextSibling) {
        indexes.push(node.getDataNode().getKey());
      }
      commands.push(['reorder', this.dataAddress, indexes]);
    }
    this.db.batch(commands, [this.onStore, this, [cb]]);
  };

  Root.onStore = function (results, cb) {
    this.indexOffset = 0;
    if (cb) js.lang.callback(cb, this, [results]);
    this.dispatchAction('stored');
  };

  Root.removeSelected = function () {
    var node = this.selected;
    node.reset();
    node.deselect();
    var addr = node.getDataNode().getAddress();
    this.db.remove(addr, [this.onRemove, this, [node]]);
  };

  Root.onRemove = function (dnode, node) {
    var sibling = node.previousSibling || node.nextSibling;
    node.setAttribute('select_sibling', sibling);
    node.remove();
  };

  Root.unload = function () {
    for (var i = 0, al; al = this.als[i]; i++) {
      al.remove();
    }
    var node = this.firstChild;
    while (node) {
      node.unload();
      node = node.nextSibling;
    }
  };

});
