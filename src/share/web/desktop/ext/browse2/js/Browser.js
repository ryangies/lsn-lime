ECMAScript.Extend('lsn.desktop.ext.browse', function (ecma) {

  var CExtension = ecma.lsn.desktop.Extension;

  this.FileManager = function () {
    CExtension.apply(this);
    this.db = ecma.hubb.getInstance();
    this.treeView = new ecma.lsn.desktop.ext.browse.TreeView();
  };

  var FileManager = this.FileManager.prototype = ecma.lang.createMethods(
    CExtension
  );

});
