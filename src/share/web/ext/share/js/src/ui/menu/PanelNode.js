/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;
  var CNode = js.data.Node;

  /**
   * @class PanelNode
   */

  Package.PanelNode = function CPanelNode (data, context, selector) {
    CNode.call(this, data);
    this.als = []; // Action listeners
    this.createUI();
    this.setContext(context);
    this.setSelector(selector);
  };

  var PanelNode = Package.PanelNode.prototype = js.lang.createMethods(
    CNode
  );

  PanelNode.setContext = function (context) {
    this.context = context;
    this.walk(function (child) {
      child.setContext(context);
    });
  };

  PanelNode.setSelector = function (selector) {
    while (this.als.length) {
      var al = this.als.pop();
      al.remove();
    }
    this.selector = selector;
    if (this.selector && this.data && this.data.target) {
      switch (this.data.target) {
        case 'selection':
          this.setAvailable(false);
          this.als.push(
            this.selector.addActionListener('onSelect', this.onSelectTarget, this),
            this.selector.addActionListener('onDeselect', this.onDeselectTarget, this)
          );
          break;
        case 'cwd':
          this.als.push(
            this.selector.addActionListener('onChangeDirectory', this.onSelectTarget, this)
          );
          break;
        default:
          throw new TypeError('invalid panel-menu target');
      }
    }
    this.walk(function (child) {
      child.setSelector(selector);
    });
  };

  PanelNode.createNode = function (data) {
    js.lang.assert(this !== this.rootNode); // Root node must implement
    return this.rootNode.createNode.apply(this.rootNode, arguments);
  };

  PanelNode.createLayer = function (node, name) {
    for (var child = node.firstChild; child; child = child.nextSibling) {
      this.loadItem(child.data, this.context, this.selector);
    }
    return this;
  };

  // The first child created is returned such that the caller can
  // is presented with a PanelNode object (just like C<loadItem>) and can
  // call C<nextSibling> or child methods to access what is created.
  PanelNode.load = function (items, context, selector) {
    if (!items) return;
    var result = null;
    for (var i = 0, item; item = items[i]; i++) {
      var child = this.loadItem(item, context, selector);
      if (!result) result = child;
    }
    return result; // first child created
  };

  PanelNode.loadItem = function (item, context, selector) {
    if (!item) return;
    var child = this.appendChild(item, context, selector);
    child.attachUI();
    child.load(item.items);
    return child;
  };

  PanelNode.attachUI = function () {
    js.dom.appendChildren(this.parentNode.getAppendage(), this.getElements());
  };

  PanelNode.onOrphan = function (node) {
    js.dom.removeElements(node.getElements());
    node.removeAllChildren();
  };

  PanelNode.getAppendage = function () {
    return this.getElements()[0];
  };

  PanelNode.onSelectTarget = function (action, item) {
    this.setAvailable(this.canDisplay(item));
  };

  PanelNode.onDeselectTarget = function (action, item) {
    this.setAvailable(false);
  };

  PanelNode.canDisplay = function (item) {
    return true;
  };

  PanelNode.setAvailable = function (isAvailable) {
    var elements = this.getElements();
    if (isAvailable) {
      for (var i = 0, elem; elem = elements[i]; i++) {
        js.dom.removeClassName(elem, 'panel-menu-unavailable');
      }
    } else {
      for (var i = 0, elem; elem = elements[i]; i++) {
        js.dom.addClassName(elem, 'panel-menu-unavailable');
      }
    }
  };

});
