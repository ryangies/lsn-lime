js.extend('lsn.ext.dde', function (js) {

  var CComboBox = js.hubb.ui.ComboBox;
  var proto = js.lang.createMethods(CComboBox);

  this.FileCombo = function () {
    CComboBox.apply(this);
  };

  this.FileCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});
