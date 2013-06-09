js.extend('lsn.desktop.ext.edit.ace', function (js) {

  this.MenuMain = function (eMenuId, editor) {
    this.parentElement = js.dom.getElement(eMenuId);
    this.editor = editor;
    this.createUI();
  };

  var MenuMain = this.MenuMain.prototype = js.lang.createMethods();

  MenuMain.createUI = function () {
    var children = [];
    this.saveButton = js.dom.createElement('button=Save', {
      'onClick': [this.onSave, this]
    });
    children.push(this.saveButton);
    this.reloadButton = js.dom.createElement('button=Reload', {
      'onClick': [this.onReload, this]
    });
    children.push(this.reloadButton);
    this.ddeButton = js.dom.createElement('button=Edit as Live HTML', {
      'onClick': [this.onDDE, this]
    });
    children.push('#text= ');
    children.push(this.ddeButton);
    this.rootElement = js.dom.createElement('div', children);
    this.parentElement.appendChild(this.rootElement);
  };

  MenuMain.onSave = function (event) {
    this.editor.saveContent();
  };

  MenuMain.onReload = function (event) {
    this.editor.reload();
  };

  MenuMain.onDDE = function (event) {
    var addr = this.editor.dnode.getAddress();
    var uri = '/desktop/ext/dde/index.html?doc=' + addr;
    try {
      var props = {
        'id': js.util.randomId('editor'),
        'src': uri,
        'icon': '/res/icons/16x16/apps/accessories-text-editor.png',
        'name': 'Editor',
        'side': 'right',
        'canClose': true
      };
      js.window.top.js.lsn.desktop.createTab(props);
    } catch (ex) {
      js.console.log(ex);
      js.window.open(uri);
    }
  };

});
