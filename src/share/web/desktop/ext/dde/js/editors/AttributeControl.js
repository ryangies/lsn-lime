ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;
  var _attrProps = [#:js:var ./attributes.hf];

  this.AttributeControl = function (attr, ds) {
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
      ecma.console.log('No control properties for attribute: ' + attr);
    }
  };

  var AttributeControl =
    this.AttributeControl.prototype =
      ecma.lang.createMethods(CActionDispatcher);

  AttributeControl.getRootElement = function () {
    return this.ui.root || this.createUI();
  };

  AttributeControl.createUI = function () {
    // Label
    this.ui.dt = ecma.dom.createElement('DT', {
      'innerHTML': this.props.label
    });
    // Input element
    this.ui.dd = ecma.dom.createElement('DD');
    this.input = this.createInput();
    if (!this.hidden) {
      this.ui.dd.appendChild(this.input);
      this.extendInput();
    }
    // Label/input pair
    this.ui.root = ecma.dom.createElement('DL', [
      this.ui.dt,
      this.ui.dd
    ]);
    return this.ui.root;
  };

  AttributeControl.createInput = function () {
    var input = null;
    if (this.props.options) {
      input = ecma.dom.createElement('SELECT');
      for (var j = 0, opt; opt = this.props.options[j]; j++) {
        var optElem = ecma.dom.createElement('OPTION', {
          'value': opt.value,
          'innerHTML': opt.text
        });
        input.appendChild(optElem);
      }
    } else if (this.hidden) {
      input = {'value': null};
    } else {
      input = ecma.dom.createElement('INPUT');
      this.vChange = new ecma.dom.EventListener(input, 'change',
        this.onChange, this);
    }
    return input;
  };

  AttributeControl.extendInput = function () {
    if (this.attr == 'src') {
      this.combo = new ecma.lsn.ext.dde.ImageCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    } else if (this.attr == 'href') {
      this.combo = new ecma.lsn.ext.dde.FileCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    }
  };

  AttributeControl.onChange = function () {
    this.dispatchAction('onChange');
  };

  AttributeControl.getHelp = function () {
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

  AttributeControl.setOriginalValue = function (value) {
    this.orig = value;
    this.input.value = value;
    return value;
  };

  AttributeControl.setValue = function (value) {
    ecma.dom.setValue(this.input, value);
    return value;
  };

  AttributeControl.getValue = function () {
    return this.hidden ? this.orig : ecma.dom.getValue(this.input);
  };

  AttributeControl.reset = function () {
    this.orig = '';
  };

  AttributeControl.destroy = function () {
    if (this.vChange) this.vChange.remove();
    if (this.combo) this.combo.destroy();
  };

});
