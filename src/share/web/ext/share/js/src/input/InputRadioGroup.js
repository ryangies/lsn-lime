/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = _package.InputBase;

  _package.InputRadioGroup = function (params) {
    CInputBase.apply(this, [params]);
    this.inputs = {};
    this.labels = {};
    this.firstInput = undefined;
    this.groupName = js.util.randomId('radiogroup');
    this.elements = this.createElements();
    this.load(this.getParameter('options'));
  };

  var _proto = _package.InputRadioGroup.prototype = js.lang.createMethods(
    CInputBase
  );

  _package.factory.set('radio-group', _package.InputRadioGroup);

  _proto.load = function (ds) {
    if (!ds) return;
    if (js.util.isObject(ds)) {
      this.createRadios(ds);
    } else {
      env.hub.fetch(ds, [this.onLoad, this]);
    }
  };

  _proto.onLoad = function (dnode) {
    this.createRadios(dnode.toObject());
  };

  _proto.createRadios = function (options) {
    if (js.util.isAssociative(options)) {
      for (var value in options) {
        this.addRadio(value, options[value]);
      }
    } else if (js.util.isArray(options)) {
      for (var i = 0, opt; opt = options[i]; i++) {
        if (typeof(opt) === 'string') {
          this.addRadio(opt, opt);
        } else {
          this.addRadio(opt.value, opt.text);
        }
      }
    }
    // Rewrite the value now that the options are present (caller may setValue
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

  _proto.createElements = function () {
    this.elem = js.dom.createElement('DIV.radio-group');
    return [this.elem];
  }

  _proto.addRadio = function (value, text) {
    var id = js.util.randomId('radio');
    var radioInput = js.dom.createElement('INPUT', {
      'id': id,
      'type': 'radio',
      'name': this.groupName,
      'onChange': [this.onInputChange, this]
    });
    this.els.push(
      new js.dom.EventListener(radioInput, 'change', this.onInputChange, this)
    );
    var label = js.dom.createElement('LABEL', {
      'for': id,
      'innerHTML': text
    });
    if (this.getParameter('layout') == "vertical") {
      js.dom.appendChild(this.elem, js.dom.createElement('DIV',
        [radioInput, label]));
    } else {
      js.dom.appendChildren(this.elem, [radioInput, label]);
    }
    this.inputs[value] = radioInput;
    this.labels[value] = text;
    if (!this.firstInput) {
      this.firstInput = radioInput;
    }
  };

  _proto.onInputChange = function (action, input) {
    this.executeClassAction('onChange', this);
  };

  _proto.getValueText = function () {
    return this.labels[this.getValue()];
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
      var elem = this.inputs[key];
      js.dom.removeAttribute(elem, 'disabled');
    }
  };

  _proto.disable = function () {
    for (var key in this.inputs) {
      var elem = this.inputs[key];
      js.dom.setAttribute(elem, 'disabled', 'disabled');
    }
  };

  _proto.read = function () {
    this.value = this.emptyValue;
    for (var key in this.inputs) {
      var elem = this.inputs[key];
      var isChecked = js.dom.getValue(elem);
      if (js.dom.getValue(elem)) {
        this.value = key;
        break;
      }
    }
    return this;
  };

  _proto.write = function () {
    var elem = this.inputs[this.value];
    if (elem) js.dom.setValue(elem, true);
  };

  _proto.sync = function () {
    return this;
  };

});
