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
