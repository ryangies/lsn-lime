/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CDialog = js.ext.share.ui.RunDialog;
  var CForm = js.ext.share.input.Form;

  /**
   * @class DialogForm
   */

  _package.DialogForm = function () {
    CDialog.apply(this, arguments);
    this.form = new CForm();
  };

  var _proto = _package.DialogForm.prototype = js.lang.createMethods(
    CDialog
  );

  _proto.getValues = function () {
    return this.form.getValues();
  };

  _proto.serializeValues = function () {
    return this.form.serializeValues();
  };

  _proto.onDialogReady = function () {
    this.form.select();
  };

});
