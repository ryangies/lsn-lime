js.extend('lsn.ext.wireframe.ui', function (js) {

  var CView = js.lsn.ext.wireframe.ui.View;
  var CItem = js.lsn.ext.wireframe.ui.ListItem;

  this.ListView = function (app) {
    CView.apply(this, arguments);
    this.items = [];
    this.selected = undefined;
    js.action.addActionListener(CItem, 'onSelect', this.onSelect, this);
    js.action.addActionListener(CItem, 'onDeselect', this.onDeselect, this);
    js.action.addActionListener(CItem, 'onExpand', this.onExpand, this);
    js.action.addActionListener(CItem, 'onCollapse', this.onCollapse, this);
    app.addActionListener('onCreateNode', this.onCreateNode, this);
    app.addActionListener('onDeleteNode', this.onDeleteNode, this);
  };

  var _proto = this.ListView.prototype = js.lang.createMethods(
    CView
  );

  _proto.onPageLoad = function () {
    var buttons = js.dom.getElementsByTagName(js.dom.getElement('ListButtons'), 'BUTTON');
    for (var i = 0, btn; btn = buttons[i]; i++) {
      js.dom.addEventListener(btn, 'click', this.onButtonClick, this);
    }
    this.uiRoot = js.dom.getElement('ListView');
    this.uiTBody = js.dom.createElement('tbody');
    this.uiRoot.appendChild(this.uiTBody);
    this.createItem(app.root);

    // Populate the typeName select list
    this.uiTypeName = js.dom.getElement('typeName');
    var options = []
    var allowed = js.lsn.ext.wireframe.data.getAllowedTypes().sort();
    for (var idx in allowed) {
      options.push(js.dom.createElement('option', {
        value: allowed[idx],
        innerHTML: allowed[idx]
      }));
    }
    js.dom.replaceChildren(this.uiTypeName, options);

  };

  _proto.onButtonClick = function (event) {
    js.dom.stopEvent(event);
    var btn = js.dom.getEventTarget(event);
    var cmd = js.dom.getAttribute(btn, 'value');
    var values = {};
    if (btn.parentNode.tagName == 'FORM') {
      values = js.dom.getValues(btn.parentNode);
    }
    this.app.exec(cmd, values);
  };

  // When a node is created, automatically select it
  _proto.onCreateNode = function (action, node) {
    this.select(node);
  };

  // When a node is deleted, automatically select the preceding or succeeding item
  _proto.onDeleteNode = function (action, node, altNode) {
    try {
      if (altNode) this.select(altNode);
    } catch (ex) {
    }
  };

  _proto.newItem = function (node) {
    var item = this.items[node.id] = new CItem(node);
    return item;
  };

  _proto.onAdopt = function (action, node) {
//  js.console.log('+' + node.id);
    CView.prototype.onAdopt.apply(this, arguments);
    this.createItem(node);
  }

  _proto.createItem = function (node) {
    var item = this.newItem(node);
    var prevItem = undefined;
    var nextItem = undefined;
    if (node.previousSibling) {
      var id = node.previousSibling.id;
      var n = node.previousSibling;
      // The preceding node (the one which appears "above" this one in a 
      // sequential context)
      while (n.lastChild) {
        n = n.lastChild;
        id = n.id;
      }
      prevItem = this.items[id];
//  } else if (node.nextSibling) {
//    nextItem = this.items[node.nextSibling.id];
    } else if (node.parentNode) {
      prevItem = this.items[node.parentNode.id];
    }
    if (prevItem) {
      js.dom.insertAfter(item.getUI(), prevItem.getUI());
//  } else if (nextItem) {
//    js.dom.insertBefore(item.getUI(), nextItem.getUI());
    } else {
      js.dom.appendChild(this.uiTBody, item.getUI());
    }
    for (var i = 0, childNode; childNode = node.childNodes[i]; i++) {
      if (this.items[childNode.id]) this.removeItem(childNode);
      this.createItem(childNode);
    }
  };

  _proto.onOrphan = function (action, node) {
//  js.console.log('-' + node.id);
    CView.prototype.onOrphan.apply(this, arguments);
    this.removeItem(node);
  }

  _proto.removeItem = function (node) {
    var item = this.items[node.id];
    if (item) {
      if (item === this.selected) {
        item.deselect();
      }
      item.destroy();
      delete this.items[node.id];
      for (var i = 0, childNode; childNode = node.childNodes[i]; i++) {
        this.removeItem(childNode);
      }
    }
  };

  _proto.select = function (node) {
    var id = node.id;
    var item = this.items[id];
    if (!item) throw 'Cannot select item: ' + id + ' not found';
    item.select();
  };

  _proto.onSelect = function (action, item) {
    if (this.selected && this.selected !== item) {
      this.selected.deselect();
    }
    this.selected = item;
    this.executeAction('onSelect', item.node);
  };

  _proto.onDeselect = function (action, item) {
    this.selected = undefined;
    if (item.node) this.executeAction('onDeselect', item.node);
  };

  _proto.onExpand = function (action, item) {
  };

  _proto.onCollapse = function (action, item) {
  };


});
