js.extend('local', function () {

  // Data bridge
  this.db = js.hubb.getInstance();

  // The list (tree) of files/folders/data
  this.tview = new js.hubb.ui.TreeView();
  this.tview.detailColumns[0] = function (dnode, td) {
    var bytes = dnode.isFile() ? dnode.getAttribute('size') : undefined;
    if (js.util.defined(bytes)) {
      bytes = js.units.bytesize(bytes);
    } else {
      bytes = '';
    }
    js.dom.setValue(td, bytes);
  };
  this.tview.detailColumns[1] = function (dnode, td) {
    var dateObj = dnode.getDate();
    if (!dateObj) return;
    var dateStr = '';
    dateStr += dateObj.getFullYear();
    dateStr += '-' + js.util.pad(dateObj.getMonth() + 1, 2);
    dateStr += '-' + js.util.pad(dateObj.getDate(), 2);
    var timeStr = '';
    timeStr += js.util.pad(dateObj.getHours(), 2);
    timeStr += ':' + js.util.pad(dateObj.getMinutes(), 2);
    timeStr += ':' + js.util.pad(dateObj.getSeconds(), 2);
    js.dom.setValue(td, dateStr + ' ' + timeStr);
  };
  this.tview.detailColumns[2] = function (dnode, td) {
    js.dom.setValue(td, dnode.getType());
  };
  this.tview.onStore = function (action, dnode) {
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    tnode.updateUI();
  };

  this.onSelect = function (action, tnode) {
    js.dom.removeClassName('action1', 'na');
    js.dom.removeClassName('action2', 'na');
    js.dom.setAttribute('title-icon', 'src', tnode.data.getIcon());
    js.dom.setAttribute('title-name', 'href', tnode.data.getAddress());
    js.dom.setValue('title-name', tnode.data.getAddress());
    js.dom.removeClassName('titleleft', 'hidden');
//  js.local.openQuickView(tnode.data);
  };

  this.onDeselect = function (action, tnode) {
    js.dom.addClassName('action1', 'na');
    js.dom.addClassName('action2', 'na');
    js.dom.addClassName('titleleft', 'hidden');
    js.local.closeQuickView(tnode.data);
  };

  this.rmsel = function (event) {
    js.dom.stopEvent(event);
    var sel = js.local.tview.getSelection();
    if (sel.length) {
      var addr = sel[0].data.getAddress();
      if (confirm('Are you sure you want to delete: ' + addr)) {
        js.local.db.remove(addr);
      }
    }
  };

  this.cpsel = function (event) {
    var sel = js.local.tview.getSelection();
    if (sel.length) {
      if (!js.local.copyDialog) {
        js.local.copyDialog = new js.hubb.ui.CopyDialog();
      }
      js.local.copyDialog.show(sel[0].data);
    }
  };

  this.mvsel = function (event) {
    var sel = js.local.tview.getSelection();
    if (sel.length) {
      if (!js.local.moveDialog) {
        js.local.moveDialog = new js.hubb.ui.MoveDialog();
      }
      js.local.moveDialog.show(sel[0].data);
    }
  };

  this.newdir = function (tnode) {
    if (!tnode) {
      tnode = js.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!js.local.newdirDialog) {
      js.local.newdirDialog = new js.hubb.ui.NewDirectoryDialog();
    }
    js.local.newdirDialog.show(tnode.data);
  };

  this.newtxt = function (tnode) {
    if (!tnode) {
      tnode = js.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!js.local.newtxtDialog) {
      js.local.newtxtDialog = new js.hubb.ui.NewFileDialog();
    }
    js.local.newtxtDialog.show(tnode.data);
  };

  this.upload = function (tnode) {
    if (!tnode) {
      tnode = js.local.tview.getSelection()[0];
      if (!tnode) return;
    }
/*
    new js.hubb.ui.UploadDialog().show(tnode.data);
*/
    if (!js.local.uploadDialog || js.local.uploadDialog.isLoading) {
      js.local.uploadDialog = new js.hubb.ui.UploadDialog();
    }
    js.local.uploadDialog.show(tnode.data);
  };

  this.download = function (tnode) {
    if (!tnode) {
      tnode = js.local.tview.getSelection()[0];
      if (!tnode) return;
    }
    if (!js.local.downloadDialog) {
      js.local.downloadDialog = new js.hubb.ui.DownloadDialog();
    }
    js.local.downloadDialog.show(tnode.data);
  };

});
