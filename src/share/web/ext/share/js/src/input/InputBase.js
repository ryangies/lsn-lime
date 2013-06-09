/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;

  /**
   *
   *        .------------------------------------------------------------------ serialized notation
   *        |
   *        |                .------------------------------------------------- javascript object
   *        |                |
   *        |                |                   .----------------------------- ui string notation
   *        |                |                   |
   *        |                |                   |                    .-------- user input
   *        |                |                   |                    |
   *  [data string] <---> [object] <---> [control string] <---> [input element]
   *                  |              |                      |
   *                  |              |                      '------------------ read/write
   *                  |              |
   *                  |              '----------------------------------------- unmarshal/marshal
   *                  |
   *                  '-------------------------------------------------------- serialize/deserialize
   *
   * For example:
   *
   *  [3.14E0] <---> [Number] <---> [3.14] <---> [input element]
   *
   *    * When the user enters "abc", which is not a number, the control string
   *      should become "0.00" and the input element updated.  The internal
   *      value (which is a Number) is set to zero.
   *
   * The input control interracts with JavaScript using:
   *
   *    * getValue, which returns the internal value object
   *
   *    * setValue, which takes an object of the same type as the internal
   *      value object
   *
   *    * serialize, which returns a storable data string
   *
   *    * deserialize, which takes a String as would be returned by serialize.
   *
   * The input control interracts with the user using:
   *
   *    * read, which reads the value from the element and sets the internal 
   *      value object accordingly.
   *
   *    * write, which sets the value of the element from the internal value
   *      object.
   *
   *    * sync, which responds to an onChange event, reading the new value and
   *      then writing it back out.
   *
   */

  var CAction = js.action.ActionDispatcher;
  var CParameters = js.impl.Parameters;

  _package.InputBase = function (params) {
    CParameters.call(this, params);
    CAction.call(this);
    this.elem = null;
    this.elements = null;
    this.value = this.emptyValue = null;
    this.els = [];
  };

  var _proto = _package.InputBase.prototype = js.lang.createMethods(
    CParameters,
    CAction
  );
  
  _proto.attach = function (elem) {
    this.elem = elem;
    var el = new js.dom.EventListener(this.elem, 'change', function(event) {
      this.sync();
      this.executeClassAction('onChange', this);
    }, this);
    this.els.push(el);
    return elem;
  };

  _proto.getElements = function () {
    if (!this.elements) {
      this.elements = this.createElements();
      this.write(); // Initial value
    }
    return this.elements;
  };

  _proto.createElements = function () {
    var cssClass = this.getParameter('type') || 'text';
    var elem = js.dom.createElement('INPUT.' + cssClass, {'type':'text'});
    return [this.attach(elem)];
  };

  _proto.focus = function () {
    try {
      this.elem.focus();
    } catch (ex) {
      // Does not exist
      // Is detached or otherwise not visible
      // Does not support method
    }
  };

  _proto.select = function () {
    try {
      this.elem.select();
    } catch (ex) {
      // Does not exist
      // Is detached or otherwise not visible
      // Does not support method
    }
  };

  _proto.enable = function () {
    js.dom.removeAttribute(this.elem, 'disabled');
  };

  _proto.disable = function () {
    js.dom.setAttribute(this.elem, 'disabled', 'disabled');
  };

  _proto.isHidden = function () {
    return false;
  };

  _proto.detach = function () {
    for (var i in this.els) {
      this.els[i].remove();
    }
    this.els = [];
  };

  _proto.reset = function () {
    return this.setValue(this.emptyValue);
  };

  _proto.getValue = function () {
    this.read();
    return this.value;
  };

  _proto.getValueText = function () {
    return this.marshal(this.value);
  };

  _proto.setValue = function (value) {
    this.value = value;
    this.write();
    return this;
  };

  _proto.sync = function () {
    this.read();
    this.write();
    return this;
  };

  _proto.read = function () {
    var ctrlValue = js.dom.getValue(this.elem);
    this.value = this.unmarshal(js.util.firstDefined(ctrlValue, ''));
    return this;
  };

  _proto.write = function () {
    js.dom.setValue(this.elem, this.marshal(this.value));
    return this;
  };

  _proto.marshal = function (dataValue) {
    var ctrlValue = dataValue;
    return ctrlValue;
  };

  _proto.unmarshal = function (ctrlValue) {
    var dataValue = ctrlValue;
    return dataValue;
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(storedValue);
    return this;
  };

  _proto.serialize = function () {
    return this.getValue();
  };

});
