js.extend('lsn.ext.dde.tools', function (js) {

  var proto = {};

  this.Href = function (btn, elem) {
    this.dde = btn.dde;
    this.elem = null;
    this.createUI();
  };

  this.Href.prototype = proto;

  proto.createUI = function () {
    // DOM elements
    this.ui = new Object();
    // Input contol
    this.ui.ctrl = js.dom.createElement('input', {
      onChange: [this.onChange, this],
      style: {
        'width': '400px'
      }
    });
    // Container for all ui elements
    this.ui.root = js.dom.createElement('div', {
      style: {
        'display': 'inline'}
      }, [
        this.ui.ctrl
      ]
    );
    this.list = new js.lsn.ext.dde.FileCombo();
    this.list.attach(this.ui.ctrl);
    this.list.expand('/');
    this.list.addActionListener('userselect', this.onSelect, this);
  };

  proto.getElement = function () {
    return this.ui.root;
  };

  proto.onShow = function (args) {
    this.elem = args[0];
    var value = this.elem ? this.dde.js.dom.getAttribute(this.elem, 'href') : '';
    js.dom.setValue(this.ui.ctrl, value);
    this.list.hide();
  };

  proto.onChange = function (event) {
    if (!this.elem) return;
    this.elem.href = this.ui.ctrl.value;
  };

  proto.onSelect = function () {
    this.onChange();
  };

});
