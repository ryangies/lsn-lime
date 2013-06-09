/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;

  _package.TabList = function (selector) {
    this.selector = selector;
    this.uiRoot = null;
    this.tabs = [];
    this.createUI();
    this.selector.addActionListener('onAdd', this.onSelectorAdd, this);
    this.selector.addActionListener('onRemove', this.onSelectorRemove, this);
    this.selector.addActionListener('onSelect', this.onSelectorSelect, this);
    this.selector.addActionListener('onDeselect', this.onSelectorDeselect, this);
  };

  var _proto = _package.TabList.prototype = js.lang.createMethods();

  _proto.Tab = _package.Tab; // Inner class

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.createUI = function () {
    this.uiRoot = js.dom.createElement('OL.tablist');
  };

  _proto.get = function (target) {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].getTarget() === target) {
        return this.tabs[i];
      }
    }
  };

  _proto.add = function (tab) {
    this.tabs.push(tab);
    js.dom.appendChildren(this.uiRoot, tab.getElements());
    return tab;
  };

  _proto.remove = function (tab) {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i] === tab) {
        this.tabs.splice(i, 1);
        tab.removeUI();
        return tab;
      }
    }
  };

  _proto.onSelectorAdd = function (action, target) {
    var tab = new this.Tab(this.selector, target);
    this.add(tab);
  };

  _proto.onSelectorRemove = function (action, target) {
    var tab = this.get(target);
    if (tab) this.remove(tab);
  };

  _proto.onSelectorSelect = function (action, target) {
    var tab = this.get(target);
    if (tab) tab.onSelect(action, target);
  };

  _proto.onSelectorDeselect = function (action, target) {
    var tab = this.get(target);
    if (tab) tab.onDeselect(action, target);
  };

});
