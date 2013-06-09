js.extend('lsn.hashtable.view', function (js) {

  var CComboBox = js.hubb.ui.ComboBox;

  this.FileCombo = function () {
    CComboBox.apply(this);
  };

  var FileCombo = this.FileCombo.prototype = js.lang.createMethods(CComboBox);

  FileCombo.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

  FileCombo.canDisplay = function (tnode) {
    return tnode.getKey() != 'index.hf';
  };

});
