js.extend('desktop.ext.edit.data', function (js) {

  var CInput = js.lsn.forms.InputText;

  this.InputText = function (node) {
    CInput.apply(this, [js.dom.createElement('input.wide')]);
    this.node = node;
    this.deserialize(node.getValue());
    this.si = new js.desktop.ext.edit.data.StatusIcon();
    this.ui = [this.elem].concat(this.si.getUI());
  };

  var _proto = this.InputText.prototype = js.lang.createMethods(
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
