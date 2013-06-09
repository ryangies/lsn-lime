/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CDialog = js.lsn.ui.Dialog;

  /**
   * @class DialogStatus
   */

  _package.DialogStatus = function () {
    CDialog.apply(this, arguments);
    this.addActionListener('onDialogLoad', this.initDialog, this);
    env.layout.addActionListener('onPageResize', this.doResize, this);
  };

  var _proto = _package.DialogStatus.prototype = js.lang.createMethods(
    CDialog
  );

  _proto.doResize = function (action) {
    this.center();
  };

  _proto.initDialog = function (action) {
    this.makeModal();
  };

});

