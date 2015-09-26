/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;

  _package.InputCheckboxes = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = '';
    this.inputs = {};
    this.labels = {};
    this.firstInput = undefined;
    this.elements = this.createElements();
    this.load(this.getParameter('options'));
  };

  var _proto = _package.InputCheckboxes.prototype = js.lang.createMethods(
    CInputBase
  );

  _package.factory.set('checkboxes', _package.InputCheckboxes);

  _proto.load = function (ds) {
    if (!ds) return;
    if (js.util.isObject(ds)) {
      this.createCheckboxes(ds);
    } else {
      env.hub.fetch(ds, [this.onLoad, this]);
    }
  };

  _proto.onLoad = function (dnode) {
    this.createCheckboxes(dnode.toObject());
  };

  _proto.createCheckboxes = function (options) {
    if (js.util.isAssociative(options)) {
      for (var value in options) {
        this.addCheckbox(value, options[value]);
      }
    } else if (js.util.isArray(options)) {
      for (var i = 0, opt; opt = options[i]; i++) {
        if (typeof(opt) === 'string') {
          this.addCheckbox(opt, opt);
        } else {
          this.addCheckbox(opt.value, opt.text);
        }
      }
    }
    // Rewrite the value now that the options are present (caller may setValue
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

  _proto.createElements = function () {
    this.elem = js.dom.createElement('DIV.checkboxes');
    return [this.elem];
  }

  _proto.addCheckbox = function (value, text) {
    var checkboxInput = _package.factory.createObject(
      'checkbox', {
        'label': text
      }
    );
    checkboxInput.addActionListener('onChange', this.onInputChange, this);
    if (this.getParameter('layout') == "vertical") {
      js.dom.appendChild(this.elem, js.dom.createElement('DIV',
        checkboxInput.getElements()));
    } else {
      js.dom.appendChildren(this.elem, checkboxInput.getElements());
    }
    this.inputs[value] = checkboxInput;
    this.labels[value] = text;
    if (!this.firstInput) {
      this.firstInput = checkboxInput;
    }
  };

  _proto.onInputChange = function (action, input) {
    this.read();
    this.executeClassAction('onChange', this);
  };

  _proto.getValueText = function () {
    var textValues = [];
    for (var value in this.inputs) {
      var input = this.inputs[value];
      if (input.getValue().valueOf()) {
        textValues.push(this.labels[value]);
      }
    }
    return textValues.join(',');
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(storedValue.split(this.getParameter('delimeter', ',')));
    return this;
  };

  _proto.serialize = function () {
    return this.value.join(this.getParameter('delimeter', ','));
  };

  _proto.focus = function () {
    try {
      this.firstInput.focus();
    } catch (ex) {
      // Does not exist
    }
  };

  _proto.select = function () {
    try {
      this.firstInput.select();
    } catch (ex) {
      // Does not exist
    }
  };

  _proto.enable = function () {
    for (var key in this.inputs) {
      this.inputs[key].enable();
    }
  };

  _proto.disable = function () {
    for (var key in this.inputs) {
      this.inputs[key].disable();
    }
  };

  _proto.detach = function () {
    for (var key in this.inputs) {
      this.inputs[key].detach();
    }
  };

  _proto.read = function () {
    var values = [];
    for (var value in this.inputs) {
      var input = this.inputs[value];
      if (input.getValue().valueOf()) {
        values.push(value);
      }
    }
    this.value = values;
    return this;
  };

  _proto.write = function () {
    for (var key in this.inputs) {
      var input = this.inputs[key];
      var bPrimitive = js.util.grep(key, this.value) !== null ? true : false;
      input.setValue(new Boolean(bPrimitive));
    }
  };

  _proto.sync = function () {
    return this;
  };

});
