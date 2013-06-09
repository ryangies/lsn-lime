js.extend('desktop.ext.edit.data', function (js) {

  var CInput = js.lsn.forms.InputTextarea;

  this.InputTextarea = function (node) {
    CInput.apply(this, [js.dom.createElement('textarea.wide')]);
    this.node = node;
    this.deserialize(node.getValue());
    this.si = new js.desktop.ext.edit.data.StatusIcon();
    this.rszta = new js.desktop.ext.edit.data.ResizeTextarea(this.elem);
    this.ui = [this.elem].concat(this.si.getUI()).concat(this.rszta.getUI());
  };

  var _proto = this.InputTextarea.prototype = js.lang.createMethods(
    CInput
  );

  _proto.getUI = function () {
    return this.ui;
  };

  _proto.sync = function () {
    this.read();
    this.write();
    this.save();
    return this;
  };

  _proto.save = function () {
    this.node.setValue(this.serialize());
    js.dom.setAttribute(this.elem, 'disabled', 'disabled');
    this.si.showActive();
    js.hubb.getInstance().store(
      this.node.getAddress(),
      this.node.getValue(),
      [this.onSaveComplete, this]
    );
  };

  _proto.onSaveComplete = function () {
    js.dom.removeAttribute(this.elem, 'disabled');
    this.si.showComplete();
  };

});
