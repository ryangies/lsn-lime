/** @namespace ext.editors.hash.ui */
js.extend('ext.editors.hash.ui', function (js) {

  var _package = this;
  var CTab = js.ext.share.ui.Tab;

  _package.Tab = function (selector, target) {
    CTab.apply(this, arguments);
    this.alOpen = target.addActionListener('onLoad', this.onTargetOpen, this);
  };

  var _proto = _package.Tab.prototype = js.lang.createMethods(
    CTab
  );

  _proto.onTargetOpen = function (action, target) {
    if (!target) return;
    var dnode = target.getDataNode();
    if (this.alUpdate) this.alUpdate.remove();
    this.alUpdate = dnode.addActionListener('update', this.updateUI, this);
    this.updateUI(null, dnode);
  };

  _proto.updateUI = function (action, dnode) {
    var addr = dnode.getAddress();
    js.dom.setAttribute(this.uiAnchor, 'href', addr);
    js.dom.setAttribute(this.uiAnchor, 'title', addr);
    js.dom.setAttribute(this.uiIcon, 'src', dnode.getIcon());
    js.dom.setValue(this.uiMark, dnode.getKey());
  };

  _proto.removeUI = function (action, target) {
    CTab.prototype.removeUI.call(this);
    this.alOpen.remove();
    if (this.alUpdate) this.alUpdate.remove();
  };

});
