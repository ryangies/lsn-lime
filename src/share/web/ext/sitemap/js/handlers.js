js.extend('ext.sitemap', function (js) {

  env.registerHandler('ext-sitemap-expand', function (action, node) {
    var type = node.data.getValue('.type');
    if (type && type == 'category') {
      node.setAsCwd();
      node.expand();
      return true;
    } else {
      env.invokeHandler('ext-sitemap-edit-live', node);
    }
  });

  env.registerHandler('ext-sitemap-edit-properties', function (action, node) {
    var dnode = node.data;
    var type = dnode.getString('.type');
    env.dialogs.get('ext-sitemap-edit-' + type).show(dnode);
//  env.dialogs.get('ext-sitemap-overlay').show(dnode);
  });

  env.registerHandler('ext-sitemap-move-up', function (action, targetNode) {
    var previousNode;
    var node = targetNode.previousSibling;
    while (node && !previousNode) {
      if (node.canDisplay()) previousNode = node;
      node = node.previousSibling;
    }
    if (!previousNode) return;
    var parentNode = targetNode.parentNode;
    var indexes = [];
    var child = parentNode.firstChild;
    while (child) {
      if (child === previousNode) {
        indexes.push(targetNode.data.getKey());
        indexes.push(previousNode.data.getKey());
        child = targetNode.nextSibling;
      } else {
        indexes.push(child.data.getKey());
        child = child.nextSibling;
      }
    }
    var db = parentNode.data.getDataBridge();
    var addr = parentNode.data.getAddress();
    env.showLoading();
    db.reorder(addr, indexes, function () {
      env.hideLoading();
    });
  });

  env.registerHandler('ext-sitemap-move-down', function (action, targetNode) {
    var nextNode;
    var node = targetNode.nextSibling;
    while (node && !nextNode) {
      if (node.canDisplay()) nextNode = node;
      node = node.nextSibling;
    }
    if (!nextNode) return;
    var parentNode = targetNode.parentNode;
    var indexes = [];
    var child = parentNode.firstChild;
    while (child) {
      if (child === targetNode) {
        indexes.push(nextNode.data.getKey());
        indexes.push(targetNode.data.getKey());
        child = nextNode.nextSibling;
      } else {
        indexes.push(child.data.getKey());
        child = child.nextSibling;
      }
    }
    var db = parentNode.data.getDataBridge();
    var addr = parentNode.data.getAddress();
    env.showLoading();
    db.reorder(addr, indexes, function () {
      env.hideLoading();
    });
  });

  env.registerHandler('ext-sitemap-edit-live', function (action, node) {
    var addr = [];
    var n = node;
    while (n && n !== n.rootNode) {
      addr.unshift(n.data.getKey());
      n = n.parentNode;
    }
    addr.unshift('');
    var targetAddress = js.data.addr_join(addr);
    var screen = env.screens.get('/ext/editors/live/');
    if (screen) {
      env.screens.select(screen, {'addr': targetAddress});
    }
  });

});
