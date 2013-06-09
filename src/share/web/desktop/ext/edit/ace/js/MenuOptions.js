js.extend('lsn.desktop.ext.edit.ace', function (js) {

  this.MenuOptions = function (eMenuId, editor) {
    this.parentElement = js.dom.getElement(eMenuId);
    this.editor = editor;
    this.createUI();
  };

  var MenuOptions = this.MenuOptions.prototype = js.lang.createMethods();

  MenuOptions.createUI = function () {
    this.options = [];
    var themes = js.lsn.desktop.ext.edit.ace.metadata.themes;
    for (var i = 0, theme; theme = themes[i]; i++) {
      this.options.push(js.dom.createElement('option', {
        'value': theme.alias,
        'innerHTML': theme.alias
      }));
    }
    this.themeList = js.dom.createElement('select', {
      'onChange': [this.onSelectTheme, this]
    }, this.options);
    this.rootElement = js.dom.createElement('div', {
    }, [this.themeList]);
    this.parentElement.appendChild(this.rootElement);
  };

  MenuOptions.onSelectTheme = function (event) {
    var themeName = js.dom.getValue(this.themeList);
    this.editor.setTheme(themeName);
  };

});
