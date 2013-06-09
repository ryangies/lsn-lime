js.extend('local', function (js) {

  this.View = function () {
    this.rows = [];
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    this.uiStatus = js.dom.createElement('P.status');
    this.uiOutput = js.dom.createElement('DIV.output');
    this.uiBody = js.dom.createElement('TBODY');
    this.uiRoot = js.dom.createElement('DIV', [
      this.uiStatus,
      'TABLE.results', [ this.uiBody ],
      this.uiOutput
    ]);
    return this.uiRoot;
  };

  _proto.updateStatus = function (value) {
    var status = js.dom.getValue(this.uiStatus);
    if (status) status += " &raquo ";
    status += value;
    js.dom.setValue(this.uiStatus, status);
  };

  _proto.setAutohide = function (state) {
    var toggle = state ? js.dom.addClassName : js.dom.removeClassName;
    toggle(this.uiRoot, 'autohide');
  };

  _proto.clear = function () {
    var table = this.getRootElement();
    this.rows = [];
    js.dom.removeChildren(this.uiBody);
    js.dom.removeChildren(this.uiOutput);
    js.dom.removeChildren(this.uiStatus);
    this.updateStatus('Initial');
  };

  _proto.updateUI = function (data) {
    var part = data.toObject();
    switch (part.type) {
      case 'update':
        this.updateResults(part.args);
        break;
      case 'error':
        alert(part.args[0]);
        break;
      case 'status':
        this.updateStatus(part.args[0]);
        break;
      case 'output':
        this.updateOutput(part.args[0]);
        break;
      default:
        throw 'Unknown response data';
    }
  };

  _proto.updateOutput = function (line) {
    var uiLine = js.dom.createElement('PRE');
    js.dom.appendChild(this.uiOutput, uiLine);
    js.dom.setValue(uiLine, line);
  };

  _proto.updateResults = function (args) {
    var addr = args[0];
    var status = args[1] || 'Unknown';
    var table = this.getRootElement();
    var tr;
    if (!this.rows[addr]) {
      tr = js.dom.createElement('tr', [
        'td.col2=' + addr,
        'td.col1=' + status
      ]);
      this.uiBody.appendChild(tr);
      this.rows[addr] = tr;
    } else {
      tr = this.rows[addr];
      tr.childNodes[1].innerHTML += ' &raquo; ' + status;
    }
    js.dom.addClassName(tr, status);
  };

});
