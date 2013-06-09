/** @namespace ext.share.data */
js.extend('ext.share.data', function (js) {

  this.loadHandlers = function (env) {

    env.registerHandler('data-reorder-previous', function (action, targetNode) {
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
          indexes.push(targetNode.getDataNode().getKey());
          indexes.push(previousNode.getDataNode().getKey());
          child = targetNode.nextSibling;
        } else {
          indexes.push(child.getDataNode().getKey());
          child = child.nextSibling;
        }
      }
      var db = parentNode.getDataNode().getDataBridge();
      var addr = parentNode.getDataNode().getAddress();
      env.showLoading();
      db.reorder(addr, indexes, function () {
        env.hideLoading();
      });
    });

    env.registerHandler('data-reorder-next', function (action, targetNode) {
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
          indexes.push(nextNode.getDataNode().getKey());
          indexes.push(targetNode.getDataNode().getKey());
          child = nextNode.nextSibling;
        } else {
          indexes.push(child.getDataNode().getKey());
          child = child.nextSibling;
        }
      }
      var db = parentNode.getDataNode().getDataBridge();
      var addr = parentNode.getDataNode().getAddress();
      env.showLoading();
      db.reorder(addr, indexes, function () {
        env.hideLoading();
      });
    });

  };

});
