js.extend('lsn.ext.dde.tools', function (js) {

  var proto = {};

  this.Para = function (btn, elem) {
    this.dde = btn.dde;
    this.elem = null;
    this.createUI();
  };

  this.Para.prototype = proto;

  proto.createUI = function () {
    // DOM elements
    this.ui = new Object();
    // Input contol
    this.ui.ctrl = js.dom.createElement('select', {
      'onChange': [this.onChange, this]
    }, [
      'option', {'value': '',     'innerHTML': 'Default'},
      'option', {'value': 'h1',   'innerHTML': 'Heading 1'},
      'option', {'value': 'h2',   'innerHTML': 'Heading 2'},
      'option', {'value': 'h3',   'innerHTML': 'Heading 3'},
      'option', {'value': 'h4',   'innerHTML': 'Heading 4'},
      'option', {'value': 'h5',   'innerHTML': 'Heading 5'}
    ]);
    // Container for all ui elements
    this.ui.root = js.dom.createElement('div', {
      style: {
        'display': 'inline'}
      }, [
        this.ui.ctrl
      ]
    );
  };

  proto.getElement = function () {
    return this.ui.root;
  };

  proto.onShow = function (args) {
  };

  proto.onChange = function (event) {
  };

});
