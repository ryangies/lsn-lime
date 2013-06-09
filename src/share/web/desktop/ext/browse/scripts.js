js.extend('lsn.ext.browse', function (js) {

  var editorDefs = [#:js:var "/desktop/ext/edit/index.hf/editors"];
 
  var baseClass = js.hub.List;
  var proto = js.lang.Methods(baseClass);
  
  this.Tree = function (e, addr, ui) {
    this.ui = ui;
    this.dlgs = {
      cp: new js.lsn.Dialog('/res/lsn/dlg/copy.html', {refetch:false}),
      mv: new js.lsn.Dialog('/res/lsn/dlg/move.html', {refetch:false}),
      rm: new js.lsn.Dialog('/res/lsn/dlg/remove.html', {refetch:false})
    };
    baseClass.call(this, e, js.hub.getInstance(), addr, this.opts);
    this.kp.setHandler('delete', this.rmsel, this);
    this.editors = {};
  };

  this.Tree.prototype = proto;

  proto.opts = {

    onClick: function (event, node) {
      if (event.ctrlKey) {
        parent.js.desktop.browse(node, true);
        js.dom.stopEvent(event);
      }
    },

    formatDetail: function (node) {
      if (node.type.match(/^data/)) {
        return ['', '', node.type];
      } else {
        return [node.dateStr, node.timeStr, node.type];
      }
    },

    onSelect: function (node) {
      if (this.sel == this.lsel) return;
      js.dom.removeChildren(js.dom.getElement('editmenu'));
      if (this.sel && this.sel != this.ra) {
        for (var i = 0; i < this.ui.actions.length; i++) {
          js.dom.removeClassNames(this.ui.actions[i], 'na');
        }
      } else {
        for (var i = 0; i < this.ui.actions.length; i++) {
          js.dom.addClassNames(this.ui.actions[i], 'na');
        }
      }
      if (this.editor) this.editor.hide();
      js.dom.replaceChildren(this.ui.title, js.dom.createElements(
        'div', {'class': 'title'}, [
          'img', {'src': node.icon, 'class': 'icon'},
          'a', {'href': node.addr, 'innerHTML': node.addr, 'target': '_new'}
        ]
      ));
      this.editor = this.getEditor(node);
      if (!this.editor) return;
      this.editor.show({
        'node': node,
        'hub': js.hub.getInstance()
      });
    }

  };

  proto.chroot = function (a) {
    baseClass.prototype.chroot.call(this, a);
    if (!this.sel) {
      for (var i = 0; i < this.ui.actions.length; i++) {
        js.dom.addClassNames(this.ui.actions[i], 'na');
      }
    }
    this.expand(this.ra, true);
  };

  proto.cpsel = function (event) {
    this.showdlg('cp', event);
  };

  proto.mvsel = function (event) {
    this.showdlg('mv', event);
  };

  proto.rmsel = function (event) {
    this.showdlg('rm', event);
  };

  proto.intab = function (event) {
    var n = this.getsn();
    if (!n) return;
    parent.js.lsn.desktop.browse(n, true);
  };

  proto.getsn = function () {
    if (!this.sel) return;
    if (this.sel == this.ra) return;
    return this.dm.get(this.sel);
  };

  proto.showdlg = function (id, event) {
    var n = this.getsn();
    if (!n) return;
    var params = {'hub':js.hub.getInstance(), 'node':n};
    if (event) {
      params.target = js.dom.getEventTarget(event);
    }
    this.dlgs[id].show(params);
  };

  proto.getEditor = function (n) {
    var url = undefined;
    for (var i = 0; !url && i < editorDefs.length; i++) {
      var def = editorDefs.get(i);
      var equals = def.get('type-equals');
      if (js.util.defined(equals)) {
        if (n.type == equals) {
          url = def.get('widget.url');
        }
      } else {
        var match = def.get('type-match');
        if (js.util.defined(match)) {
          if (n.type.match(match)) {
            url = def.get('widget.url');
          }
        }
      }
    }
    if (!url) return;
    if (!this.editors[url]) {
      this.editors[url] = new js.lsn.desktop.Editor(url, {
        container: 'editarea',
        refetch: false
      },
      {
        menu: js.dom.getElement('editmenu')
      });
    }
    return this.editors[url];
  };

});
