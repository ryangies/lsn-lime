js.extend('lsn.desktop.ext.edit.ace', function (js) {

  var _aceRootUri = '[#`./js`]/ace/';
  var CAction = js.action.ActionDispatcher;

  this.Editor = function (eAreaId) {
    CAction.apply(this);
    this.eArea = js.dom.getElement(eAreaId);
    this.dnode = null;
    this.ace = ace.edit(this.eArea);
    this.setTheme('clouds');
    this.db = js.hubb.getInstance();
  };

  var Editor = this.Editor.prototype = js.lang.createMethods(CAction);

  Editor.edit = function (dnode) {
    this.dnode = dnode;
    this.baseContent = null;
    this.conflict = false;
    this.loadContent();
    js.dom.setStyle(this.eArea, 'visibility', 'hidden');
    js.dom.setTimeout(this.onReady, 250, this);
  };

  Editor.clear = function () {
    try {
      this.dnode.removeActionListener('update', this.onNodeUpdated, this);
    } finally {
      this.dnode = null;
    }
  };

  Editor.onReady = function () {
    if (this.dnode) {
      this.ace.gotoLine(1);
      this.setMode(this.dnode.getType());
      this.dnode.addActionListener('update', this.onNodeUpdated, this);
    }
    js.dom.setStyle(this.eArea, 'visibility', 'visible');
  };

  Editor.onNodeUpdated = function (action, dnode) {
    if (!this.hasChanged()) {
      this.loadContent();
    } else {
      this.conflict = true;
      this.dispatchAction('conflict', dnode);
    }
  };

  Editor.loadContent = function () {
    if (this.dnode) {
      var content = this.dnode.getContent();
      this.ace.getSession().setValue(content);
      if (!this.conflict) this.baseContent = content;
    }
  };

  Editor.reload = function () {
    this.dnode.fetch();
  };

  Editor.saveContent = function () {
    if (this.dnode) {
      if (this.conflict && !confirm('Are you sure you want to overwrite this modified file?')) {
        return;
      }
      var value = this.getContent();
      this.conflict = false;
      this.baseContent = value;
      this.db.store(this.dnode.getAddress(), value, [this.onStore, this]);
    }
  };

  Editor.hasChanged = function () {
    var content = this.getContent();
    return this.baseContent != content;
  };

  Editor.getContent = function () {
    return this.ace.getSession().getValue();
  };

  Editor.onStore = function (dnode) {
    this.dispatchAction(dnode ? 'saved' : 'notsaved', dnode);
  };

  Editor.setTheme = function (name) {
    this.theme = js.lsn.desktop.ext.edit.ace.metadata.getThemeByAlias(name);
    if (this.theme.source) {
      js.dom.include.script({
        src: _aceRootUri + this.theme.source,
        id: this.theme.name
      }, [this.onThemeLoad, this]);
    } else {
      this.onThemeLoad();
    }
  };

  Editor.onThemeLoad = function () {
    this.ace.setTheme(this.theme.name);
  };

  Editor.setMode = function (type) {
    this.mode = js.lsn.desktop.ext.edit.ace.metadata.getModeByType(type);
    if (this.mode.source) {
      js.dom.include.script({
        src: _aceRootUri + this.mode.source,
        id: this.mode.name
      }, [this.onModeLoad, this]);
    } else {
      this.onModeLoad();
    }
  };

  Editor.onModeLoad = function () {
    var modeClass = require(this.mode.name).Mode;
    this.ace.getSession().setMode(new modeClass());
  };

});
