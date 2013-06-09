ECMAScript.Extend('lsn.desktop.ext.browse', function (ecma) {

  var CTreeView = new ecma.hubb.ui.TreeView();
  // The list (tree) of files/folders/data
  this.tview = new ecma.hubb.ui.TreeView();
  this.tview.detailColumns[0] = function (dnode, td) {
    var bytes = dnode.isFile() ? dnode.getAttribute('size') : undefined;
    if (ecma.util.defined(bytes)) {
      bytes = ecma.units.bytesize(bytes);
    } else {
      bytes = '';
    }
    ecma.dom.setValue(td, bytes);
  };
  this.tview.detailColumns[1] = function (dnode, td) {
    var dateObj = dnode.getDate();
    if (!dateObj) return;
    var dateStr = '';
    dateStr += dateObj.getFullYear();
    dateStr += '-' + ecma.util.pad(dateObj.getMonth() + 1, 2);
    dateStr += '-' + ecma.util.pad(dateObj.getDate(), 2);
    var timeStr = '';
    timeStr += ecma.util.pad(dateObj.getHours(), 2);
    timeStr += ':' + ecma.util.pad(dateObj.getMinutes(), 2);
    timeStr += ':' + ecma.util.pad(dateObj.getSeconds(), 2);
    ecma.dom.setValue(td, dateStr + ' ' + timeStr);
  };
  this.tview.detailColumns[2] = function (dnode, td) {
    ecma.dom.setValue(td, dnode.getType());
  };
  this.tview.onStore = function (action, dnode) {
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    tnode.updateUI();
  };

  this.onSelect = function (action, tnode) {
    ecma.dom.removeClassName('action1', 'na');
    ecma.dom.removeClassName('action2', 'na');
    ecma.dom.setAttribute('title-icon', 'src', tnode.data.getIcon());
    ecma.dom.setAttribute('title-name', 'href', tnode.data.getAddress());
    ecma.dom.setValue('title-name', tnode.data.getAddress());
    ecma.dom.removeClassName('titleleft', 'hidden');
//  ecma.local.openQuickView(tnode.data);
  };

  this.onDeselect = function (action, tnode) {
    ecma.dom.addClassName('action1', 'na');
    ecma.dom.addClassName('action2', 'na');
    ecma.dom.addClassName('titleleft', 'hidden');
    ecma.local.closeQuickView(tnode.data);
  };

  this.rmsel = function (event) {
    ecma.dom.stopEvent(event);
    var sel = ecma.local.tview.getSelection();
    if (sel.length) {
      var addr = sel[0].data.getAddress();
      if (confirm('Are you sure you want to delete: ' + addr)) {
        ecma.local.db.remove(addr);
      }
    }
  };

  this.cpsel = function (event) {
    var sel = ecma.local.tview.getSelection();
    if (sel.length) {
      if (!ecma.local.copyDialog) {
        ecma.local.copyDialog = new ecma.hubb.ui.CopyDialog();
      }
      ecma.local.copyDialog.show(sel[0].data);
    }
  };

  this.mvsel = function (event) {
    var sel = ecma.local.tview.getSelection();
    if (sel.length) {
      if (!ecma.local.moveDialog) {
        ecma.local.moveDialog = new ecma.hubb.ui.MoveDialog();
      }
      ecma.local.moveDialog.show(sel[0].data);
    }
  };

  this.newdir = function (tnode) {
    if (!tnode) {
      tnode = ecma.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!ecma.local.newdirDialog) {
      ecma.local.newdirDialog = new ecma.hubb.ui.NewDirectoryDialog();
    }
    ecma.local.newdirDialog.show(tnode.data);
  };

  this.newtxt = function (tnode) {
    if (!tnode) {
      tnode = ecma.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!ecma.local.newtxtDialog) {
      ecma.local.newtxtDialog = new ecma.hubb.ui.NewFileDialog();
    }
    ecma.local.newtxtDialog.show(tnode.data);
  };

  this.upload = function (tnode) {
    if (!tnode) {
      tnode = ecma.local.tview.getSelection()[0];
      if (!tnode) return;
    }
/*
    new ecma.hubb.ui.UploadDialog().show(tnode.data);
*/
    if (!ecma.local.uploadDialog || ecma.local.uploadDialog.isLoading) {
      ecma.local.uploadDialog = new ecma.hubb.ui.UploadDialog();
    }
    ecma.local.uploadDialog.show(tnode.data);
  };

  this.download = function (tnode) {
    if (!tnode) {
      tnode = ecma.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!ecma.local.downloadDialog) {
      ecma.local.downloadDialog = new ecma.hubb.ui.DownloadDialog();
    }
    ecma.local.downloadDialog.show(tnode.data);
  };

});
