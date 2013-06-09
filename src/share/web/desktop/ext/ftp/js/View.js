js.extend('ext.ftp', function (js) {

  this.View = function () {
    this.rows = [];
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    this.uiRoot = js.dom.createElement('table', 
      {'class':'results'}, ['tbody']);
    this.updateResults(['STATUS', 'Initial']);
    return this.uiRoot;
  };

  _proto.setAutohide = function (state) {
    var toggle = state ? js.dom.addClassName : js.dom.removeClassName;
    toggle(this.uiRoot, 'autohide');
  };

  _proto.clear = function () {
    var table = this.getRootElement();
    var tbody = table.firstChild;
    this.rows = [];
    js.dom.removeChildren(tbody);
  };

  _proto.updateUI = function (data) {
    var part = data.toObject();
    if (part.type == 'update') {
      this.updateResults(part.args);
    } else if (part.type == 'error') {
      alert(part.args[0]);
    } else {
      throw 'Unknown response data';
    }
  }

  _proto.updateResults = function (args) {
    var addr = args[0];
    var status = args[1] || 'Unknown';
    var table = this.getRootElement();
    var tbody = table.firstChild;
    var tr;
    if (!this.rows[addr]) {
      tr = js.dom.createElement('tr', [
        'td.col2=' + addr,
        'td.col1=' + status
      ]);
      tbody.appendChild(tr);
      this.rows[addr] = tr;
    } else {
      tr = this.rows[addr];
      tr.childNodes[1].innerHTML += ' &raquo; ' + status;
    }
    js.dom.addClassName(tr, status);
  };

});
