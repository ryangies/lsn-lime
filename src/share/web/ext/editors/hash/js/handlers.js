/** @namespace ext.editors.hash */
js.extend('ext.editors.hash', function (js) {

  var config = {#:json ../desktop.hf};

  var initiator = new js.ext.share.Initiator({
    'type': 'file-action',
    'action': 'edit-modeled-data',
    'text': 'Edit Data',
    'target': 'selection',
    'tooltip': 'Edit data according to its schema',
    'icon': '/res/icons/16x16/apps/livesite.png',
    'sortValue': 2,
    'matchTypes': [/file-text-hfm/]
  });

  var handler = function (action, target, schema) {
    try {
      var params = {};
      if (js.util.isString(target)) {
        env.hub.fetch(target, function (dnode) {
          env.invokeHandler('edit-modeled-data', dnode, schema);
        });
      } else {
        params['dnode'] = target.getDataNode();
        env.schemas.fetch(schema, function (schema) {
          params['schema'] = schema;
          var screen = env.screens.get(config.addr);
          env.screens.select(screen, params);
        });
      }
    } catch (ex) {
      js.console.log('Could not open:', target, ex);
    }
  };

  env.registerHandler('edit-modeled-data', handler, initiator);

  env.registerHandler('ext-editors-hash-show-file-open', function (action) {
    env.dialogs.get('ext-share-dialog-filesystem-open').run({}, function (action, values) {
      env.invokeHandler('edit-modeled-data', values.dnode);
    });
  });

  env.registerHandler('ext-editors-hash-file-close', function (action, editor) {
    editor.close();
  });

  env.registerHandler('ext-editors-hash-file-reload', function (action, editor) {
    editor.reload();
  });

  /** Close the open editor */
  env.registerHandler('ext-editors-hash-file-save', function (action, editor) {
    editor.store();
  });

});
