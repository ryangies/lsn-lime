/** @namespace ext.editors.live.ui */
js.extend('ext.editors.live.ui', function (js) {

  var _package = this;
  var CTab = js.ext.share.ui.Tab;

  _package.Tab = function (selector, target) {
    CTab.apply(this, arguments);
    this.dnode = null;
    this.alOpen = target.addActionListener('onOpen', this.onTargetOpen, this);
  };

  var _proto = _package.Tab.prototype = js.lang.createMethods(
    CTab
  );

  _proto.onTargetOpen = function (action, addr) {
    if (!addr) return;
    addr = js.data.addr_normalize(addr);
    env.hub.get(addr, [function (dnode) {
      this.dnode = dnode;
      this.updateUI();
      this.alUpdate = this.dnode.addActionListener('update', this.updateUI, this);
    }, this]);
  };

  _proto.updateUI = function () {
    var addr = this.dnode.getAddress();
    js.dom.setAttribute(this.uiAnchor, 'href', addr);
    js.dom.setAttribute(this.uiAnchor, 'title', addr);
    js.dom.setAttribute(this.uiIcon, 'src', this.dnode.getIcon());
    js.dom.setValue(this.uiMark, this.dnode.getKey() || 'Home');
  };

  _proto.removeUI = function (action, target) {
    CTab.prototype.removeUI.call(this);
    this.alOpen.remove();
    this.alUpdate.remove();
  };

});
