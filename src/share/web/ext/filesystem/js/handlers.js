js.extend('ext.filesystem', function (js) {

  env.registerHandler('fs-open', function (action, node, event) {
    if (node.data.isDirectory()) {
      node.setAsCwd();
      node.expand();
      return true;
    }
  });

  env.registerHandler('fs-open', function (action, node, event) {
    env.dialogs.get('ext-filesystem-context-menu').show(action.event);
    return false;

    var matches = [];
    env.initiators.walk(function (child) {
      var initiator = child.data;
      if (initiator.type == 'file-action'
          && initiator.match(node.data)) {
        matches.push(initiator);
      }
    });
    switch (matches.length) {
      case 0:
        return false;
      case 1:
        env.invokeHandler(matches[0].action, node);
        return true;
      default:
        js.console.log('Multiple options');
        env.dialogs.get('ext-filesystem-context-menu').show(action.event);
        return false;
    }
  });

  env.dialogs.register('ext-filesystem-new-folder', js.hubb.ui.NewDirectoryDialog);
  env.registerHandler('ext-filesystem-show-create-folder', function (action, node) {
    env.dialogs.get('ext-filesystem-new-folder').show(node.data);
  });

  env.dialogs.register('ext-filesystem-new-file', js.hubb.ui.NewFileDialog);
  env.registerHandler('ext-filesystem-show-create-file', function (action, node) {
    env.dialogs.get('ext-filesystem-new-file').show(node.data);
  });

  env.dialogs.register('ext-filesystem-upload', js.hubb.ui.UploadDialog);
  env.registerHandler('ext-filesystem-show-upload-file', function (action, node) {
    env.dialogs.get('ext-filesystem-upload').show(node.data);
  });

  env.dialogs.register('ext-filesystem-download', js.hubb.ui.DownloadDialog);
  env.registerHandler('ext-filesystem-show-fetch-file', function (action, node) {
    env.dialogs.get('ext-filesystem-download').show(node.data);
  });

  env.dialogs.register('ext-filesystem-copy', js.hubb.ui.CopyDialog);
  env.registerHandler('ext-filesystem-show-copy', function (action, node) {
    env.dialogs.get('ext-filesystem-copy').show(node.data);
  });

  env.dialogs.register('ext-filesystem-move', js.hubb.ui.MoveDialog);
  env.registerHandler('ext-filesystem-show-move', function (action, node) {
    env.dialogs.get('ext-filesystem-move').show(node.data);
  });

  env.registerHandler('ext-filesystem-show-delete', function (action, node) {
    var addr = node.data.getAddress();
    if (confirm('Are you sure you want to delete: ' + addr)) {
      env.hub.remove(addr);
    }
  });

});
