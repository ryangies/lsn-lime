/** @namespace ext.editors.live */
js.extend('ext.editors.live', function (js) {

  env.dialogs.register('ext-editors-live-file-open', js.hubb.ui.BrowseDialog, function () {
    var browseDialog = this;
    browseDialog.dlg.addEvent('ok', function () {
      addr = browseDialog.getTarget().getAddress();
      env.invokeHandler('edit-html-live', addr);
    });
  });

  env.registerHandler('ext-editors-live-file-open', function (action) {
    env.dialogs.get('ext-editors-live-file-open').show();
    //.show(this.docLoc.pathname);
  });

  env.registerHandler('ext-editors-live-file-save', function (action, panel) {
    panel.dde.exec('docSave');
  });

  env.registerHandler('ext-editors-live-file-reload', function (action, panel) {
    panel.dde.exec('docRefresh');
  });

  env.registerHandler('ext-editors-live-file-close', function (action, panel) {
    if (panel.dde.hasChanged()) {
      if (!confirm('Discard changes?')) {
        return;
      }
    }
    panel.close();
  });

  env.registerHandler('ext-editors-live-file-goto', function (action, panel) {
    panel.dde.exec('docGoto');
  });

  env.registerHandler('ext-editors-live-file-mail', function (action, panel) {
    panel.dde.exec('docMail');
  });

  env.registerHandler('ext-editors-live-file-view-source', function (action, panel) {
    panel.dde.exec('docViewSource');
  });

});
