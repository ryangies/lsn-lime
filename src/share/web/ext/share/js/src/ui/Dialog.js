/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CDialog = js.lsn.ui.Dialog;

  /**
   * @class Dialog
   */

  _package.Dialog = function () {
    CDialog.apply(this, arguments);
    this.hasClosed = false;
    this.addActionListener('onDialogLoad', this.initMoveable, this);
    this.addActionListener('onDialogShow', this.initContext, this);
    this.addActionListener('onDialogHide', this.onClose, this);
    env.layout.addActionListener('onPageResize', this.doResize, this);
  };

  var _proto = _package.Dialog.prototype = js.lang.createMethods(
    CDialog
  );

  _proto.doResize = function (action) {
    this.center();
  };

  _proto.onClose = function () {
    this.hasClosed = true;
  };

  _proto.initMoveable = function (action) {
    if (!this.uiParent) {
      var screen = env.screens.getSelected();
      this.setParentElement(screen ? screen.uiRoot : null);
    }
    var handle = this.getElementById('move-handle');
    if (handle) this.makeMoveable(handle);
  };

  _proto.initContext = function (action) {
    if (js.window.parent !== js.window) return; // Desktop panels
    var screen = env.screens.getSelected();
    if (screen) this.setParentElement(screen.uiRoot);
  };

});
