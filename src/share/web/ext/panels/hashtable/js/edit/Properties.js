js.extend('lsn.hashtable.edit', function (js) {

  var CDispatcher = js.action.ActionDispatcher;

  this.Properties = function (app) {
    CDispatcher.call(this);
    this.app = app;
    this.ui = null;
    this.fields = null;
  };

  var Properties = this.Properties.prototype = js.lang.createMethods(CDispatcher);

  Properties.getRootElement = function () {
    if (!this.fields) this.fields = this.createFields();
    if (!this.ui) this.ui = this.createUI();
    return this.ui.root;
  };

  Properties.createFields = function () {
    var fields = [];
    for (var i = 0, spec; spec = this.app.schema.fields[i]; i++) {
      fields.push(new js.lsn.hashtable.edit.Field(spec));
    }
    return fields;
  };

  Properties.createUI = function () {
    var ui = {'root': js.dom.createElement('DIV#fields')};
    var firstField = true;
    for (var i = 0, field; field = this.fields[i]; i++) {
      switch (field.getDisplay()) {
        case 'heading':
          js.dom.appendChild(ui.root, js.dom.createElement(
            'H3#heading', {'innerHTML': field.getValue()}
          ));
          firstField = true;
          break;
        case 'field':
          field.addActionListener('change', this.executeAction, this);
          var div = js.dom.createElement('DIV#field', [
            'DIV#label', field.getLabelElements(),
            'DIV#input', field.getInputElements()
          ]);
          if (firstField) {
            js.dom.addClassName(div, 'first');
            firstField = false;
          }
          js.dom.appendChild(ui.root, div);
          break;
        case 'hidden':
          // No assocaited UI
          break;
      }
    }
    return ui;
  };

  Properties.reset = function () {
    for (var i = 0, field; field = this.fields[i]; i++) {
      field.reset();
    }
  };

});
