js.extend('site', function (js) {

  this.LabelField = function (id, label) {
    this.elem = js.dom.getElement(id);
    this.label = label;
    this.state = undefined;
    this.value = undefined;
    this.readonly = js.dom.getAttribute(this.elem, 'type') == 'hidden';
    if (!this.readonly) {
      new js.dom.EventListener(this.elem, 'focus', this.onFocus, this);
      new js.dom.EventListener(this.elem, 'blur', this.onBlur, this);
      this.setState(this.INITIAL);
    }
  };

  var _proto = this.LabelField.prototype = js.lang.createMethods();

  // Field states
  _proto.INITIAL    = 1;
  _proto.EDITING    = 2;
  _proto.READY      = 3;
  _proto.SUBMITTING = 4;
  _proto.ERROR      = 5;

  _proto.setState = function (state) {
    js.dom.removeAttribute(this.elem, 'readonly');
    js.dom.removeClassName(this.elem, 'err');
    switch (state) {
      case this.INITIAL:
        js.dom.addClassName(this.elem, 'lbl');
        js.dom.setValue(this.elem, this.label);
        this.value = undefined;
        break;
      case this.EDITING:
        js.dom.removeClassName(this.elem, 'lbl');
        if (this.value === undefined) js.dom.setValue(this.elem, '');
        break;
      case this.READY:
        if (this.value === undefined) return this.setState(this.INITIAL);
        break;
      case this.SUBMITTING:
        js.dom.setAttribute(this.elem, 'readonly', 'readonly');
        return;
        break;
      case this.ERROR:
        js.dom.addClassName(this.elem, 'err');
        return;
        break;
    }
//  js.console.log('field [' + this.getName() + ']', 'state=' + state, 'value=' + this.value);
    return this.state = state;
  };

  _proto.onFocus = function (event) {
    this.setState(this.EDITING);
  };

  _proto.onBlur = function (event) {
    this.readValue();
    this.setState(this.READY);
  };

  _proto.readValue = function () {
    if (this.state != this.INITIAL) {
      var value = js.dom.getValue(this.elem);
      if (value || value == '0') {
        this.value = value;
      } else {
        this.value = undefined;
      }
    }
    return this.value;
  };

  _proto.getValue = function () {
    return this.readValue();
  };

  _proto.getName = function () {
    return js.dom.getAttribute(this.elem, 'name');
  };

});
