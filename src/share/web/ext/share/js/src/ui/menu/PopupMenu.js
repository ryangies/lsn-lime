/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

//js.dom.addEventListener(this.clickMask.ui, 'click', this.hide, this);
//isActive: function () {

  var _package = this;
  var CDialog = js.lsn.ui.Dialog;

  /**
   * @class PopupMenu
   */

  _package.PopupMenu = function () {
    CDialog.apply(this, arguments);
    this.fxDuration = 10;
    this.onShowEvent = null;
  };

  var _proto = _package.PopupMenu.prototype = js.lang.createMethods(
    CDialog
  );

  _proto.createUI = function () {
    this.position = 'absolute';
    this.uiRoot = js.dom.createElement('DIV.popup-menu', {
      'style': {
        'position': this.position,
        'z-index': '-1',
        'top': '0',
        'left': '0',
        'margin': '0'
      }
    });
    js.dom.setOpacity(this.uiRoot, 0);
    new js.dom.EventListener(this.uiRoot, 'onClick', this.hide, this, [], true);
    return this.uiRoot;
  };

  _proto.show = function (event) {
    this.onShowEvent = event;
    CDialog.prototype.show.call(this);
  };

  _proto.hide = function (event) {
    CDialog.prototype.hide.call(this);
  };

  _proto.setPosition = function () {
    var elem = this.getRoot();
    var vp = env.layout.getViewport();
    var pointer = js.dom.getEventPointer(this.onShowEvent);
    // Position at the pointer, with a fuzzy margin
    var t = pointer.y - 10;
    var l = pointer.x - 10;
    // Find the bottom-right corner
    var h = js.dom.getContentHeight(elem);
    var w = js.dom.getContentWidth(elem);
    var b = t + h;
    var r = l + w;
    // Readjust so as to stay on-screen
    t += Math.min(vp.height - b, 0)
    l += Math.min(vp.width - r, 0)
    t = Math.max(t, 0);
    l = Math.max(l, 0);
    // Apply
    js.dom.setStyle(elem, 'top', t + 'px');
    js.dom.setStyle(elem, 'left', l + 'px');
  };

  _proto.onDialogLoad = function (action) {
    var mask = this.makeMasked();
    mask.setOpacity(0);
  };

  _proto.onDialogReady = function (action) {
    this.autoHideListener =
      new js.dom.EventListener(this.mask.getRoot(), 'onMouseOver', this.hide, this);
  };

  _proto.onDialogHide = function (action) {
    this.autoHideListener.remove();
  };

});
