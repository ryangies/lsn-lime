js.extend('lsn.ext.dde', function (js) {

  var CComboBox = js.hubb.ui.ComboBox;
  var proto = js.lang.createMethods(CComboBox);

  this.ImageCombo = function () {
    CComboBox.apply(this);
  };

  this.ImageCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});
