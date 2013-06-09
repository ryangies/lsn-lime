js.extend('admin.worksheet', function (js) {

  this.Worksheet = function () {
    this.table = undefined;
    this.controls = [];
  };

  var proto = this.Worksheet.prototype = js.lang.createMethods();

  proto.attach = function (id) {
    var ctrls = js.dom.getElementsByTagName(id, ['INPUT', 'TEXTAREA']);
    var tables = js.dom.getElementsByTagName(id, 'TABLE');
    this.table = tables[0];
    var rowIndex = -1;
    var columnIndex = -1;
    var currentTr = undefined;
    for (var i = 0, ctrl; ctrl = ctrls[i]; i++) {
      var tr = ctrl.parentNode.parentNode;
      if (tr.tagName != 'TR') throw 'Invalid layout';
      if (tr !== currentTr) {
        rowIndex++;
        columnIndex = 0;
        this.controls[rowIndex] = [];
        currentTr = tr;
      } else {
      }
      this.controls[rowIndex][columnIndex] =
        new js.admin.worksheet.EditCell(ctrl, this, rowIndex, columnIndex);
      columnIndex++;
    }
  };

  proto.setTableStyle = function () {
    if (!this.table) return;
    var tbody = js.dom.getElementsByTagName(this.table, 'TBODY')[0];
    var t = js.dom.getTop(tbody);
    var vph = js.dom.getViewportPosition().height;
    var h = vph - t - 20;
    js.dom.setStyles(tbody, {
      'overflow-y': 'auto',
      'overflow-x': 'hidden',
      'height': h + 'px',
      'padding-right': '20px'
    });
  };

});

js.extend('admin.worksheet', function (js) {
  var proto = {};
  this.EditCell = function (ctrl, worksheet, rowIndex, columnIndex) {
    this.td = ctrl.parentNode;
    this.ctrl = ctrl;
    this.worksheet = worksheet;
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.ev = {};
    this.ev.clk = new js.dom.EventListener(this.td, 'click', this.onClick, this);
    this.ev.foc = new js.dom.EventListener(this.ctrl, 'focus', this.onFocus, this);
    this.ev.blr = new js.dom.EventListener(this.ctrl, 'blur', this.onBlur, this);
    this.ev.chg = new js.dom.EventListener(this.ctrl, 'change', this.onChange, this);
    this.ev.ken = new js.dom.KeyListener(this.ctrl, 'enter', this.onNextRow, this);
    this.ev.kse = new js.dom.KeyListener(this.ctrl, 'shift+enter', this.onPrevRow, this);
    this.ev.kup = new js.dom.KeyListener(this.ctrl, 'up', this.onPrevRow, this);
    this.ev.kdn = new js.dom.KeyListener(this.ctrl, 'down', this.onNextRow, this);
  };
  this.EditCell.prototype = proto;
  proto.save = function () {
    var addr = this.ctrl.id;
    var value = js.data.entities.decode(this.ctrl.value);
    env.hub.store(addr, value, [this.onSave, this]);
  };
  proto.onClick = function (event) {
    this.ctrl.focus();
  };
  proto.onFocus = function (event) {
    var addr = this.ctrl.id;
    var value = js.data.entities.decode(this.ctrl.value);
    env.hub.fetch(addr, [this.onFetch, this, [value]]);
    js.dom.addClassName(this.td, 'edit');
  };
  proto.onBlur = function (event) {
    js.dom.removeClassName(this.td, 'edit');
  };
  proto.onChange = function (event) {
    js.dom.addClassName(this.td, 'save');
    js.dom.setAttribute(this.ctrl, 'disabled', 'disabled');
    this.save();
  };
  proto.onFetch = function (dnode, origValue) {
    if (dnode) {
      var value = dnode.getValue();
      if (value != origValue) {
        js.dom.setValue(this.ctrl, js.data.entities.encode(value));
      }
    }
  };
  proto.onSave = function (dnode) {
    if (dnode) {
      js.dom.removeClassName(this.td, 'save');
      js.dom.removeAttribute(this.ctrl, 'disabled');
    } else {
      js.dom.removeClassName(this.td, 'save');
      js.dom.addClassName(this.td, 'error');
      alert ('Failed to save data');
    }
  };
  proto.onNextRow = function (event) {
    js.dom.stopEvent(event);
    this.changeRow(1);
  };
  proto.onPrevRow = function (event) {
    js.dom.stopEvent(event);
    this.changeRow(-1);
  };
  proto.changeRow = function (amt) {
    try {
      var cell = this.worksheet.controls[this.rowIndex + amt][this.columnIndex];
      cell.ctrl.focus();
      cell.ctrl.select();
    } catch (ex) {
      js.console.log('Cannot change row');
    }
  }
});

