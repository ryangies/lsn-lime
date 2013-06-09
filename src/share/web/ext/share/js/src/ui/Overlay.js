/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CDialog = js.lsn.ui.Dialog;

  /**
   * @class Overlay
   */

  _package.Overlay = function () {
    CDialog.apply(this, arguments);
    this.layoutClass = 'overlay-area';
    js.dom.addClassNames(this.getRoot(), this.layoutClass);
  };

  var _proto = _package.Overlay.prototype = js.lang.createMethods(
    CDialog
  );

  _proto.setPosition = function () {
    // Handled by layout class
  }

  _proto.onDialogLoad = function (action) {
    if (!this.uiParent) {
      var screen = env.screens.getSelected();
      this.setParentElement(screen ? screen.uiRoot : null);
    }
    var mask = this.makeMasked();
    js.dom.addClassName(mask.getRoot(), 'overlay-mask');
  };

});
