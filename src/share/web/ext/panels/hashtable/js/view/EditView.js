js.extend('lsn.hashtable.view', function (js) {

  var CView = js.lsn.hashtable.view.View;

  this.EditView = function () {
    CView.apply(this, arguments);
    this.node = undefined;
    this.form = new js.lsn.hashtable.edit.Properties(this.app);
    this.form.addActionListener('onChange', this.onFieldChange, this);
  };

  var EditView =
  this.EditView.prototype = js.lang.createMethods(CView);

  EditView.attach = function () {
    CView.prototype.attach.apply(this, arguments);
    js.dom.replaceChildren(this.app.ui.editView, [this.form.getRootElement()]);
  };

  EditView.detach = function () {
    if (this.form && this.form.fields) {
      for (var i = 0, field; field = this.form.fields[i]; i++) {
        field.detach();
      }
    }
  };

  EditView.onFieldChange = function (action, field) {
    this.node.setValue(field.getName(), field.getValue());
  };

  EditView.select = function (node) {
    js.dom.removeClassName(this.app.ui.editMenu, 'hidden');
    js.dom.removeClassName(this.app.ui.editView, 'hidden');
    this.node = node;
    for (var i = 0, field; field = this.form.fields[i]; i++) {
      var name = field.getName();
      if (!js.util.defined(name)) continue;
      var storedValue = this.node.getValue(name);
      if (js.util.defined(storedValue)) {
        var serialized = storedValue.toString();
        if (serialized !== '') {
          field.setValue(serialized);
        } else {
          this.node.setValue(name, field.getValue());
        }
      } else {
        field.reset();
        this.node.setValue(name, field.getValue());
      }
    }
    if (this.node.isModified()) {
      this.dispatchAction('fixup');
    }
  };

  EditView.deselect = function () {
    js.dom.addClassName(this.app.ui.editMenu, 'hidden');
    js.dom.addClassName(this.app.ui.editView, 'hidden');
    this.reset();
  };

  EditView.reset = function () {
    this.form.reset();
  };

});

/*
    // Drop-down combo box for selecting video
    this.fileCombo = new js.lsn.hashtable.view.FileCombo();
    this.fileCombo.setRootAddress('/videos');
    this.fileCombo.expand('/videos');
    this.fileCombo.attach(this.app.ui.editFile);
    this.fileCombo.addActionListener('select', this.doSelectFile, this);

  EditView.doSelectFile = function (action, dnode) {
    var value = js.dom.getValue(this.app.ui.editFile);
    this.node.setValue('addr', value);
  };
*/
