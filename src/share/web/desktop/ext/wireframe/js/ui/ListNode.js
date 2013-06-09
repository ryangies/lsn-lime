js.extend('lsn.ext.wireframe.ui', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.ListItem = function (node) {
    CAction.apply(this);
    this.node = node;
    this.elems = undefined;
  };

  var _proto = this.ListItem.prototype = js.lang.createMethods(
    CAction
  );

  _proto.getElements = function () {
    return this.elems || this.createUI();
  };

  _proto.createUI = function () {
    this.uiAnchor = js.dom.createElement('a', {
      innerHTML: this.node.tagName + '(' + this.node.id + ')'
    });
    this.elems = js.dom.createElements(
      'dt', [this.uiAnchor],
      'dd'
    );
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
    return this.elems;
  };

  _proto.updateUI = function () {
    var indent = 10 * (this.node.getDepth() - 1);
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
