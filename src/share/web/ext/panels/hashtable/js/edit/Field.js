js.extend('lsn.hashtable.edit', function (js) {

  var CDispatcher = js.action.ActionDispatcher;

  this.Field = function (spec) {
    CDispatcher.apply(this);
    this.adaptor = null;
    this.labelElements = null;
    this.inputElements = null;
    this.type = null;
    this.display = null;
    this.original = null;
    this.id = null;
    this.build(spec);
  };

  var Field = this.Field.prototype = js.lang.createMethods(CDispatcher);

  Field.build = function (spec) {
    this.model = js.util.clone(spec);
    this.type = this.mapType(this.model.type);
    this.display = this.mapDisplay(this.type);
    this.id = js.util.randomId(this.type + '_');
    this.labelElements = this.createLabel();
    this.inputElements = this.createInput();
  };

  Field.mapType = function (type) {
    return type || 'text';
  };

  Field.mapDisplay = function (type) {
    return type === 'heading'   ? 'heading'     :
           type === 'hidden'    ? 'hidden'      : 'field';
  };

  Field.getDisplay = function () {
    return this.display;
  };

  Field.hasChanged = function () {
    var value = this.getValue();
    return this.type == 'password' && value == '*****' ? false :
      value == '' && !js.util.defined(this.original) ? false :
      value != this.original;
  };

  Field.isHidden = function () {
    return this.type == 'hidden';
  };

  Field.getName = function () {
    return this.model.name;
  };

  Field.getValue = function () {
    return this.adaptor.serialize();
  };

  Field.setValue = function (value) {
    return this.adaptor.deserialize(value);
  };

  Field.getLabelElements = function () {
    return this.labelElements;
  };

  Field.getInputElements = function () {
    return this.inputElements;
  };

  Field.createLabel = function () {
    var elems = [];
    if (this.model.label) {
      elems.push(js.dom.createElement('LABEL',
        {'for': this.id},
        ['#text=' + this.model.label]
      ));
    }
    return elems;
  };

  Field.createInput = function () {
    var elems = [];
    var model = this.model;
    var tag = null;
    var adaptorClass = undefined;
    var attrs = {'id': this.id, 'class': this.type, 'name': model.name};
    var cnodes = [];
    var initialValue = model.value;
    var adaptorArgs = [];
    switch (this.type) {
      case 'heading':
        adaptorClass = js.lsn.hashtable.edit.InputStatic;
        break;
      case 'text':
        adaptorClass = js.lsn.hashtable.edit.InputText;
        var maxLength = js.util.defined(model.maxlength)
          ? model.maxlength
          : 255;
        tag = 'input';
        attrs.type = 'text';
        attrs.maxlength = maxLength;
        break;
      case 'textarea':
        adaptorClass = js.lsn.hashtable.edit.InputText;
        tag = 'textarea';
        break;
      case 'password':
        adaptorClass = js.lsn.hashtable.edit.InputText;
        tag = 'input';
        initialValue = model.value ? '*****' : '';
        attrs.type = 'password';
        break;
      case 'date':
        adaptorClass = js.lsn.forms.InputDate;
        tag = 'input';
        attrs.type = 'text';
        break;
      case 'hidden':
        tag = 'input';
        attrs.type = 'hidden';
        break;
      case 'yesno':
        tag = 'SELECT';
        var opt_y = {'value': '1', 'innerHTML': 'Yes'};
        var opt_n = {'value': '0', 'innerHTML': 'No'};
        var sel = model.value ? opt_y : opt_n;
        sel.selected = 'selected';
        cnodes.push('OPTION', opt_y);
        cnodes.push('OPTION', opt_n);
        break;
      case 'select':
        tag = 'SELECT';
        adaptorClass = js.lsn.hashtable.edit.InputSelect;
        adaptorArgs.push(model.options);
        break;
      case 'join':
        tag = 'SELECT';
        adaptorClass = js.lsn.hashtable.edit.InputSelectTable;
        adaptorArgs.push(model.dataSource);
        adaptorArgs.push(model.defaultSchema);
        break;
      case 'currency':
      case 'decimal':
        adaptorClass = js.lsn.forms.InputDecimal;
        tag = 'input';
        attrs.type = 'text';
        break;
      case 'integer':
        adaptorClass = js.lsn.hashtable.edit.InputInteger;
        tag = 'input';
        attrs.type = 'text';
        break;
      case 'checkbox':
      case 'radio':
      case 'file':
      case 'time':
      case 'datetime':
      case 'integer':
      default:
        throw 'Not a known form input control type: ' + this.type;
    }
    var elem = tag ? js.dom.createElement(tag, attrs, cnodes) : null;
    adaptorArgs.unshift(elem);
    if (!adaptorClass) adaptorClass = js.lsn.forms.InputBase;
    this.adaptor = js.lang.createObject(adaptorClass, adaptorArgs);
    this.adaptor.addActionListener('*', function (action, adaptor) {
      this.executeAction(action, this);
    }, this);
    this.adaptor.sync();
    if (initialValue) {
      this.adaptor.deserialize(initialValue);
    }
    if (elem) elems.push(elem);
    if (this.model.description) {
      elems.push(js.dom.createElement('P.description',
        {'innerHTML': this.model.description}
      ));
    }
    return elems;
  };

  Field.reset = function () {
    return this.adaptor.reset();
  };

  Field.detach = function () {
    return this.adaptor.detach();
  };

});
