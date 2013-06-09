/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CDialog = js.ext.share.ui.Dialog;
  var CPerlModule = js.http.PerlModule;

  /**
   * @class RunDialog
   */

  _package.RunDialog = function () {
    CPerlModule.apply(this); // Must call setModuleURL after construction
    CDialog.apply(this, arguments);
    this.als = [];
  };

  var _proto = _package.RunDialog.prototype = js.lang.createMethods(
    CDialog,
    CPerlModule
  );

  // See DialogForm for how values differ from serialized values. Here, they
  // are the same because we don't recognize scripted controls.
  _proto.getValues = function () {
    var inputs = this.getElementById('inputs');
    return js.dom.getValues(inputs);
  };

  _proto.serializeValues = function () {
    var inputs = this.getElementById('inputs');
    return js.dom.getValues(inputs);
  };

  _proto.submit = function (subName, params, cb) {
    var values = js.util.overlay(this.serializeValues(), params);
    CPerlModule.prototype.submit.call(this, subName, values, [function (result, req, cb) {
      if (result) {
        var commands = result.getObject('commands');
        if (commands) {
          env.hub.batch(commands);
        }
      } else {
        alert(req.xhr.responseText);
      }
      if (cb) js.lang.callback(cb, this, [result, req]);
      this.executeAction('onServerResponse');
    }, this, [cb]]);
  };

  _proto.onSend = function (req) {
    env.showLoading();
  };

  _proto.onRecv = function (req) {
    env.hideLoading();
  };

  _proto.onDialogShow = function (params) {
    this.clearState();
    this.args = js.util.args(arguments);
  };

  _proto.run = function (params, cb) {
    this.show(params);
    this.als.push(this.addActionListener('onOk', this.onOk, this));
    this.als.push(this.addActionListener('onApply', this.onApply, this));
    this.als.push(this.addActionListener('onCancel', this.onCancel, this));
    if (cb) {
      this.als.push(this.addActionListener('onSubmit', cb));
    }
  };

  _proto.clearState = function () {
    delete this.args;
    while (this.als.length) {
      this.als.pop().remove();
    }
  };

  _proto.onApply = function (action) {
    this.executeAction('onSubmit', this.getValues());
  };

  _proto.onOk = function (action) {
    this.onApply(action);
    this.hide();
  };

  _proto.onCancel = function (action) {
    this.hide();
  };

});
