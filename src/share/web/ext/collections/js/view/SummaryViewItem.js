/** @namespace {#namespace}.view */
js.extend('{#namespace}.view', function (js) {

  var CNodeLayer = js.data.NodeLayer;

  this.SummaryViewItem = function (node, name, view) {
    CNodeLayer.call(this, node, name);
    this.view = view;
    this.schema = node.getSchema().clone(); // need our on fields
    this.nameSwitching = true;
    this.events = [];
    this.selectEvent = null;
  };

  var _proto = this.SummaryViewItem.prototype = js.lang.createMethods(
    CNodeLayer
  );

  _proto.onAdopted = function () {
    this.createUI();
    js.dom.appendChildren(this.view.getAppendage(), this.getElements());
  };

  _proto.onOrphaned = function () {
    this.removeUI();
  };

  function _false (event) {
    js.dom.stopEvent(event);
    return false;
  }

  _proto.getElements = function () {
    return [this.tr];
  };

  _proto.onUpdate = function (action, node) {
    this.updateUI();
  };

  _proto.createUI = function () {
    this.node.addActionListener('onSelect', this.onSelect, this);
    this.node.addActionListener('onDeselect', this.onDeselect, this);
    this.node.addActionListener('onUpdate', this.onUpdate, this);
    // Create the TR and TD columns for this data node
    this.columns = this.createColumns();
    this.tr = js.dom.createElement('TR', this.columns);
    this.events.push(
      new js.dom.EventListener(this.tr, 'click', this.onUserSelect, this),
      new js.dom.EventListener(this.tr, 'dblclick', this.onUserExpand, this),
      new js.dom.EventListener(this.tr, 'select', _false),
      new js.dom.EventListener(this.tr, 'selectstart', _false),
//    new js.dom.EventListener(this.tr, 'mousedown', _false),
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
      'onClick': [this.invokeAction, this]
    });
    this.nameStatic = js.dom.createElement('SPAN');
    // The name area allows the name to be swapped
    var name = this.nameStatic;
    this.uiNameArea = js.dom.createElement('SPAN.name', [name]);
    js.dom.replaceChildren(this.tdIcon, [this.uiIcon]);
    js.dom.replaceChildren(this.tdName, [this.uiNameArea]);
    // Derived classes initialize their columns in extendUI
    this.extendUI();
    // Updating now causes initial values to be populated
    this.updateUI();
  };

  _proto.createColumns = function () {
    var columns = [];
    this.tdIcon = js.dom.createElement('TD.icon');
    this.tdName = js.dom.createElement('TD.name');
    columns.push(this.tdIcon);
    columns.push(this.tdName);
    var fields = this.schema.getSummaryFields();
    for (var i = 1, field; field = fields[i]; i++) {
      columns.push(js.dom.createElement('TD'));
    }
    return columns;
  };

  _proto.extendUI = function () {
    var fields = this.schema.getSummaryFields();
    var nameField = fields[0];
    if (nameField.data.summary == 'edit') {
      this.nameSwitching = false;
    }
    var dnode = this.node.getDataNode();
    var iBegin = this.nameSwitching ? 1 : 0;
    for (var i = iBegin, field; field = fields[i]; i++) {
      var key = field.getName();
      this.setCellValue(i, dnode, key, field);
    }
  };

  _proto.updateUI = function () {
    var fields = this.schema.getSummaryFields();
    var dnode = this.node.getDataNode();
    if (this.nameSwitching) {
      var nameField = fields[0];
      var addr = this.node.getTargetAddress();
      var innerHTML = dnode.getValue(nameField.getName());
      js.dom.setAttribute(this.nameLinked, 'href', addr);
      js.dom.setAttribute(this.nameLinked, 'title', addr);
      js.dom.setAttribute(this.nameLinked, 'innerHTML', innerHTML);
      js.dom.setAttribute(this.nameStatic, 'innerHTML', innerHTML);
    }
    var icon = this.node.getIconPath();
    js.dom.setAttribute(this.uiIcon, 'src', icon);
  };

  _proto.setCellValue = function (i, dnode, key, field) {
    var td = this.columns[i + 1];
    var elements = [];
    if (field.data.summary == 'edit') {
      field.tieValue(dnode, key, true);
      elements = field.getElements();
    } else {
//    var valueText = dnode.getString(key)
      field.tieValue(dnode, key);
      elements = field.getDisplayElements();
      /*
      var valueText = field.getValueText();
      var valueEncoded = js.data.entities.encode(valueText, true);
      elements = js.dom.createElements('SPAN=' + valueEncoded);
      */
    }
    /*
    if (!this.nameSwitching && i == 0) {
      elements = [this.uiIcon].concat(elements);
    }
    */
    js.dom.replaceChildren(td, elements);
  };

  _proto.onReordered = function () {
    CNodeLayer.prototype.onReordered.call(this);
    this.insertUI();
  };

  _proto.insertUI = function () {
    try {
      if (this.nextSibling) {
        js.dom.insertBefore(this.tr, this.nextSibling.tr);
      } else if (this.previousSibling) {
        js.dom.insertAfter(this.tr, this.previousSibling.tr);
      } else {
        this.view.getAppendage().appendChild(this.tr);
      }
    } catch (ex) {
      js.error.reportError(ex);
    } finally {
      this.updateUI();
    }
  };

  _proto.removeUI = function () {
    js.dom.removeElements(this.getElements());
  };

  _proto.onSelect = function (action, node) {
    js.dom.addClassName(this.tr, 'selected');
    if (this.nameSwitching) {
      js.dom.replaceChildren(this.uiNameArea, [this.nameLinked]);
    }
    if (!this.selectEvent) js.dom.scrollTo(this.tr);
    this.selectEvent = null;
  };

  _proto.onDeselect = function (action, node) {
    js.dom.removeClassName(this.tr, 'selected');
    if (this.nameSwitching)
        js.dom.replaceChildren(this.uiNameArea, [this.nameStatic]);
  };

  _proto.onUserSelect = function (event) {
    js.dom.stopEvent(event);
    this.selectEvent = event;
    if (!js.dom.hasClassName(this.tr, 'selected')) {
      this.node.select();
    }
    this.node.getDataNode().fetch();
  };

  var _ignoreDoubleClickTags = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'];

  _proto.onUserExpand = function (event) {
    if (js.util.grep(event.target.tagName, _ignoreDoubleClickTags)) return;
    this.invokeAction(event);
  };

  _proto.invokeAction = function (event) {
    js.dom.stopEvent(event);
    var action = {
      'name': this.view.getAction(),
      'event': event
    }
    env.invokeHandler(action, this.node);
  };

});
