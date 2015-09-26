/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = js.ext.share.input.InputBase;

  _package.InputSelect = function (params) {
    CInputBase.apply(this, [params]);
    this.optionNodes = {};
    this.elements = this.createElements();
    this.load(this.getParameter('options'));
  };

  var _proto = _package.InputSelect.prototype = js.lang.createMethods(CInputBase);

  _package.factory.set('select', _package.InputSelect);

  _proto.createElements = function () {
    return [this.attach(js.dom.createElement('SELECT'))];
  }

  _proto.getValueText = function () {
    try {
      var ctrlValue = this.marshal(this.value);
      var text = this.optionNodes[ctrlValue];
      return js.util.isDefined(text) ? text : '';
    } catch (ex) {
      return '';
    }
  };

  _proto.load = function (ds) {
    if (!ds) return;
    if (js.util.isObject(ds)) {
      this.createOptions(ds);
    } else {
      env.hub.fetch(ds, [this.onLoad, this]);
    }
  };

  _proto.onLoad = function (dnode) {
    this.createOptions(dnode.toObject());
  };

  _proto.createOptions = function (options) {
    if (js.util.isAssociative(options)) {
      for (var value in options) {
        this.addItem(value, options[value]);
      }
    } else if (js.util.isArray(options)) {
      for (var i = 0, opt; opt = options[i]; i++) {
        if (typeof(opt) === 'string') {
          this.addItem(opt, opt);
        } else {
          this.addItem(opt.value, opt.text);
        }
      }
    }
    // Rewrite the value now that the options are present (caller may setValue 
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

  _proto.addItem = function (value, text) {
    var option = js.dom.createElement('OPTION', {
      'value': value,
      'innerHTML': text
    });
    js.dom.appendChild(this.elem, option);
    this.optionNodes[value] = text;
  };

  _proto.clear = function () {
    this.optionNodes = {};
    js.dom.removeChildren(this.elem);
    return this.setValue(this.emptyValue);
  };

});
