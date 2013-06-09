js.extend('lsn.ext.wireframe.ui', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.ListItem = function (node) {
    CAction.apply(this);
    this.node = node;
  };

  var _proto = this.ListItem.prototype = js.lang.createMethods(
    CAction
  );

  _proto.getUI = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    this.uiAnchor = js.dom.createElement('a', {
      innerHTML: this.node.tagName
    });
    this.uiRoot = js.dom.createElement('tr', [
//    'td=' + this.node.id,
      'td', [this.uiAnchor]
    ]);
    function noop (event) {
      js.dom.stopEvent(event);
      return false;
    }
    this.uiEvents = [
      new js.dom.EventListener(this.uiAnchor, 'click', this.onClick, this),
      new js.dom.EventListener(this.uiAnchor, 'dblclick', this.onDblClick, this),
      new js.dom.EventListener(this.uiAnchor, 'select', noop),
      new js.dom.EventListener(this.uiAnchor, 'selectstart', noop),
      new js.dom.EventListener(this.uiAnchor, 'mousedown', noop),
    ];
    this.updateUI();
    return this.uiRoot;
  };

  _proto.updateUI = function () {
    var indent = 8 * this.node.getDepth();
    js.dom.setStyle(this.uiAnchor, 'padding-left', indent + 'px');
  };

  _proto.destroyUI = function () {
    for (var i = 0, evt; evt = this.uiEvents[i]; i++) {
      evt.remove();
    }
    this.uiEvents = [];
  };

  _proto.onClick = function (event) {
    js.dom.stopEvent(event);
    this.select();
  }

  _proto.onDblClick = function (event) {
    js.dom.stopEvent(event);
    if (js.dom.browser.isOpera) js.dom.clearSelection();
//  this.toggle();
  }

  _proto.select = function () {
    js.dom.addClassName(this.uiRoot, 'selected');
    this.executeAction('onSelect', this);
  };

  _proto.deselect = function () {
    js.dom.removeClassName(this.uiRoot, 'selected');
    this.executeAction('onDeselect', this);
  };

  _proto.destroy = function () {
    if (this.uiRoot) js.dom.removeElement(this.uiRoot);
    this.destroyUI();
  };

});
