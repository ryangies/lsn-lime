ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CComboBox = ecma.hubb.ui.ComboBox;
  var proto = ecma.lang.createMethods(CComboBox);

  this.FileCombo = function () {
    CComboBox.apply(this);
  };

  this.FileCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});
