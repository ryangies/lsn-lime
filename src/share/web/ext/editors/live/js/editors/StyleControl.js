/** @namespace lsn.ext.dde */
js.extend('lsn.ext.dde', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;
  var _attrProps = [#:js:var ./styles.hf];

  /**
   * @class StyleControl
   */

  this.StyleControl = function (attr, ds) {
    CActionDispatcher.apply(this);
    this.ui = {}; // dom elements
    this.attr = attr; // attribute name
    this.ds = ds; // datasource
    this.orig = ''; // original value
    this.input = null; // input element
    this.combo = null; // drop-down combo box
    this.vChange = null; // onChange event listener
    try {
      this.props = _attrProps.get(this.attr).toObject();
    } catch (ex) {
      this.props = {'label': attr};
      js.console.log('No control properties for attribute: ' + attr);
    }
  };

  var StyleControl =
    this.StyleControl.prototype =
      js.lang.createMethods(CActionDispatcher);

  /**
   * @function getRootElement
   */

  StyleControl.getRootElement = function () {
    return this.ui.root || this.createUI();
  };

  /**
   * @function createUI
   */

  StyleControl.createUI = function () {
    // Label
    this.ui.dt = js.dom.createElement('DT', {
      'innerHTML': this.props.label
    });
    // Input element
    this.ui.dd = js.dom.createElement('DD');
    this.input = this.createInput();
    if (!this.hidden) {
      this.ui.dd.appendChild(this.input);
      this.extendInput();
    }
    // Label/input pair
    this.ui.root = js.dom.createElement('DL', [
      this.ui.dt,
      this.ui.dd
    ]);
    return this.ui.root;
  };

  /**
   * @function createInput
   */

  StyleControl.createInput = function () {
    var input = null;
    if (this.props.options) {
      input = js.dom.createElement('SELECT');
      for (var j = 0, opt; opt = this.props.options[j]; j++) {
        var optElem = js.dom.createElement('OPTION', {
          'value': opt.value,
          'innerHTML': opt.text
        });
        input.appendChild(optElem);
      }
    } else if (this.hidden) {
      input = {'value': null};
    } else {
      input = js.dom.createElement('INPUT');
      this.vChange = new js.dom.EventListener(input, 'change',
        this.onChange, this);
    }
    return input;
  };

  /**
   * @function extendInput
   */

  StyleControl.extendInput = function () {
    if (this.attr == 'background-image') {
      this.combo = new js.lsn.ext.dde.ImageCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    }
  };

  /**
   * @function onChange
   */

  StyleControl.onChange = function () {
    this.dispatchAction('onChange');
  };

  /**
   * @function getHelp
   */

  StyleControl.getHelp = function () {
    if (this.props.summary) {
      var str = '<b>' + this.props.label + '</b>';
      if (this.props.example) {
        str += ' (<span class="eg">e.g., ' + this.props.example + '</span>)';
      }
      str += '<br/>';
      str += this.props.summary;
      return str;
    } else {
      return '<i>No help available</i>';
    }
  };

  /**
   * @function unmarshallValue
   *    url(...) --> ...
   *    10px     --> 10
   */

  StyleControl.unmarshallValue = function (value) {
    var valueString = new String(value);
    var prefix = this.props.prefix;
    var suffix = this.props.suffix;
    if (prefix && valueString.indexOf(prefix) == 0) {
      valueString = valueString.substr(prefix.length);
    }
    if (suffix) {
      var i = valueString.lastIndexOf(suffix);
      if (i == (valueString.length - suffix.length)) {
        valueString = valueString.substring(0, i);
      }
    }
    if (valueString.match(/^[a-z]+:\/\//)) {
      var url = new js.http.Location(valueString);
      if (url.isSameOrigin()) {
        valueString = url.getAddress();
      }
    }
    valueString = valueString.replace(/^"/, '');
    valueString = valueString.replace(/"$/, '');
    return valueString;
  };

  /**
   * @function marshallValue
   *    url(...) <-- ...
   *    10px     <-- 10
   */

  StyleControl.marshallValue = function (value) {
    var valueString = new String(value);
    var prefix = this.props.prefix || '';
    var suffix = this.props.suffix || '';
    valueString = valueString.replace(/^"/, '');
    valueString = valueString.replace(/"$/, '');
    return prefix + valueString + suffix;
  };

  /**
   * @function setOriginalValue
   */

  StyleControl.setOriginalValue = function (value) {
    value = this.unmarshallValue(value);
    this.orig = value;
    this.input.value = value;
    return value;
  };

  /**
   * @function setValue
   */

  StyleControl.setValue = function (value) {
    value = this.unmarshallValue(value);
    js.dom.setValue(this.input, value);
    return value;
  };

  /**
   * @function getValue
   */

  StyleControl.getValue = function () {
    return this.hidden ? this.orig : this.marshallValue(js.dom.getValue(this.input));
  };

  /**
   * @function reset
   */

  StyleControl.reset = function () {
    this.orig = '';
  };

  /**
   * @function destroy
   */

  StyleControl.destroy = function () {
    if (this.vChange) this.vChange.remove();
    if (this.combo) this.combo.destroy();
  };

});
