ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CComboBox = ecma.hubb.ui.ComboBox;
  var proto = ecma.lang.createMethods(CComboBox);

  this.ImageCombo = function () {
    CComboBox.apply(this);
  };

  this.ImageCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});
