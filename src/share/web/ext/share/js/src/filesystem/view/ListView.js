/** @namespace ext.share.filesystem */
js.extend('ext.share.filesystem.view', function (js) {

  var CTreeView = js.ext.share.filesystem.view.TreeView;
  var CTreeViewLayer = js.ext.share.filesystem.view.TreeViewLayer;

  /**
   * @class ListView
   */

  this.ListView = function (name, tree) {
    this.tbody = js.dom.createElement('TBODY');
    this.thead = js.dom.createElement('THEAD', [
      'TR', this.createHeaders()
    ]);
    this.table = js.dom.createElement('TABLE.' + name + '.tree-list-view', [
      this.thead,
      this.tbody
    ]);
    CTreeView.apply(this, arguments);
  };

  var ListView = this.ListView.prototype = js.lang.createMethods(
    CTreeView
  );

  ListView.getElements = function () {
    return [this.table];
  };

  ListView.createHeaders = function () {
    this.thIcon = js.dom.createElement('TH.icon');
    this.thName = js.dom.createElement('TH.name=Name');
    return [this.thIcon, this.thName]
  };

  /**
   * @class ListView.Layer
   */

  ListView.Layer = function (node, name, view) {
    this.nameSwapping = true;
    this.action = 'no-operation'; // Derived class must set
    this.selectEvent = null;
    CTreeViewLayer.apply(this, arguments);
  };

  var Layer = ListView.Layer.prototype = js.lang.createMethods(
    CTreeViewLayer
  );

  Layer.createColumns = function () {
    this.tdIcon = js.dom.createElement('TD.icon');
    this.tdName = js.dom.createElement('TD.name');
    return [this.tdIcon, this.tdName];
  };

  function _false (event) {
    js.dom.stopEvent(event);
    return false;
  }

  Layer.createUI = function () {
    // Create the TR and TD columns for this data node
    this.columns = this.createColumns();
    this.tr = js.dom.createElement('TR', this.columns);
    this.events.push(
      new js.dom.EventListener(this.tr, 'click', this.onUserSelect, this),
      new js.dom.EventListener(this.tr, 'dblclick', this.onUserExpand, this),
      new js.dom.EventListener(this.tr, 'select', _false),
      new js.dom.EventListener(this.tr, 'selectstart', _false),
      new js.dom.EventListener(this.tr, 'mousedown', _false),
      new js.dom.EventListener(this.tr, 'dragstart', _false)
    );
    // The node icon
    this.uiIcon = js.dom.createElement('IMG.icon', {
      'width': '16',
      'height': '16'
    });
    // The name swaps between linked (when the row is selected) and
    // static (otherwise).
    this.nameLinked = js.dom.createElement('A', {
      'onClick': [this.onUserExpand, this]
    });
    this.nameStatic = js.dom.createElement('SPAN');
    // The name area allows the name to be swapped
    var name = this.nameSwapping ? this.nameStatic : this.nameLinked;
    this.uiNameArea = js.dom.createElement('SPAN.name', [name]);
    js.dom.replaceChildren(this.tdIcon, [this.uiIcon]);
    js.dom.replaceChildren(this.tdName, [this.uiNameArea]);
    // Derived classes initialize their columns in extendUI
    this.extendUI();
    // Updating now causes initial values to be populated
    this.updateUI();
  };

  Layer.extendUI = function () {
  };

  Layer.updateUI = function () {
    var addr = this.node.getTargetAddress();
    var name = this.node.getName();
    var icon = this.node.getIconPath();
    js.dom.setAttribute(this.nameLinked, 'href', addr);
    js.dom.setAttribute(this.nameLinked, 'title', addr);
    js.dom.setAttribute(this.nameLinked, 'innerHTML', name);
    js.dom.setAttribute(this.nameStatic, 'innerHTML', name);
    js.dom.setAttribute(this.uiIcon, 'src', icon);
  };

  Layer.onSelectCwd = function () {
    var rows = [];
    var layer = this.firstChild;
    while (layer) {
      rows.push(layer.tr);
      layer = layer.nextSibling;
    }
    var tbody = this.view.tbody;
    js.dom.replaceChildren(tbody, rows);
    this.isExpanded = true;
  };

  Layer.insertUI = function () {
    if (this.view.tree.getCwd() === this.parentNode.node) {
      try {
        if (this.nextSibling) {
          js.dom.insertBefore(this.tr, this.nextSibling.tr);
        } else if (this.previousSibling) {
          js.dom.insertAfter(this.tr, this.previousSibling.tr);
        } else {
          this.view.tbody.appendChild(this.tr);
        }
      } catch (ex) {
        // Expanded but not visible
      }
    }
  };

  Layer.removeUI = function () {
    js.dom.removeElement(this.tr);
  };

  Layer.onSelect = function (action, node) {
    js.dom.addClassName(this.tr, 'selected');
    if (this.nameSwapping) {
      js.dom.replaceChildren(this.uiNameArea, [this.nameLinked]);
    }
    if (!this.selectEvent) js.dom.scrollTo(this.tr);
    this.selectEvent = null;
  };

  Layer.onDeselect = function (action, node) {
    js.dom.removeClassName(this.tr, 'selected');
    if (this.nameSwapping) {
      js.dom.replaceChildren(this.uiNameArea, [this.nameStatic]);
    }
  };

  Layer.onUserSelect = function (event) {
    js.dom.stopEvent(event);
    this.selectEvent = event;
    if (!js.dom.hasClassName(this.tr, 'selected')) {
      this.node.select();
    }
    if (this.node.data.getType() == 'loading') return;
    this.node.data.fetch();
  };

  Layer.onUserExpand = function (event) {
    js.dom.stopEvent(event);
    var action = {
      'name': this.action,
      'event': event
    }
    env.invokeHandler(action, this.node);
  };

});
