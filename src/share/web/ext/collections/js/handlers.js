/** @namespace {#namespace} */
js.extend('{#namespace}', function (js) {

  env.registerHandler('{#screen/id}-new-collection', function (action, cwd) {
    var schema = cwd.getAvailableChildSchemas()[0];
    var storage = cwd.getAppendage();
    env.dialogs.get('{#screen/id}-create').show(schema, function (values) {
      var addr = js.data.addr_join(storage.getAddress(), '<next>');
      // Create the storage for child items (if specified)
      var manifest = schema.getChildManifest();
      if (manifest) {
        var subkey = manifest.name;
        if (!subkey) {
          throw new Error('Child manifest does not specify items subkey');
        }
        values[subkey] = manifest.type == 'array' ? [] : {};
      }
      env.hub.store(addr, values, function (dnode) {
        if (dnode) dnode.dispatchAction('onUserCreate');
      });
    });
  });

  function _createItem (storage, schema, key, bEmbedSchemaName) {

    if (!key) {
      key = storage.isDataArray()
        ? '<next>'
        : js.util.rand4() + js.util.rand4();
    }

    var addr = js.data.addr_join(storage.getAddress(), key);

    // Create storage for default values
    var value = schema.getDefaultValues();

    // Assign the schema name as a data member (REQUIRED for heterogeneous collections)
    if (bEmbedSchemaName) {
      value.schema = schema.getName();
    }

    // Create the storage for child items (if specified)
    var manifest = schema.getChildManifest();
    if (manifest) {
      var subkey = manifest.name;
      if (!subkey) {
        throw new Error('Child manifest does not specify items subkey');
      }
      value[subkey] = manifest.type == 'array' ? [] : {};
    }

    env.hub.store(addr, value, function (dnode) {
      if (dnode) dnode.dispatchAction('onUserCreate');
    });

  }

  env.registerHandler('{#screen/id}-new-item', function (action, editor) {
    _createItem(editor.getStorage(), editor.getSchema());
  });

  env.registerHandler('{#screen/id}-new-child', function (action, cwd) {

    var target = cwd.getTarget();

    if (target.isDirectory()) {

      var schema = cwd.getTargetSchema();
      var manifest = schema.getChildManifest();

      if (!manifest && js.util.isa(cwd, 
          js.{#namespace}.model.CollectionDefinition)) {
        manifest = cwd.getDataNode().toObject();
      }
      var type = manifest.type || 'file-text';
      var params = {
        'type':   type,
        'name':   js.util.rand4() + js.util.rand4(),
        'target': target.getAddress()
      };
      if (type != 'directory') {
        params['name'] += '.' + (manifest.ext || 'hf');
        params['value'] = schema.getDefaultValues();
      }
      env.hub.create(params, function (dnode) {
        if (dnode) dnode.dispatchAction('onUserCreate');
      });

    } else {
    
      var childSchemas = cwd.getAvailableChildSchemas();

      function onSelectSchema (action, values) {
        var itemSchema = childSchemas[values.choice];
        if (!itemSchema) return;
        _createItem(cwd.getAppendage(), itemSchema, values.id, true);
      }

      if (childSchemas.length > 1) {

        var options = [];
        for (var i = 0; i < childSchemas.length; i++) {
          var itemSchema = childSchemas[i];
          options.push({
            'value': i,
            'text': itemSchema.getDataValue('label')
          });
        }

        var id = js.util.rand4() + js.util.rand4();

        env.dialogs.get('ext-share-dialog-select').run({
          'schema': {
            'fields': [
              {
                'name': 'choice',
                'label': 'Type',
                'type': 'select',
                'input': {
                  'options': options
                }
              },
              {
                'name': 'id',
                'label': 'Unique identifier',
                'type': 'text',
                'value': id
              }
            ]
          }
        }, onSelectSchema);

      } else {

        _createItem(cwd.getAppendage(), childSchemas[0], null, true);

      }

    }

  });

  env.registerHandler('{#screen/id}-select-node-by-data', function (action, dnode, cwd) {
    var node = cwd.getNodeByAddress(dnode.getAddress());
    node.select();
  });

  env.registerHandler('{#screen/id}-item-properties', function (action, mnode) {
    env.dialogs.get('{#screen/id}-properties').show(mnode);
  });

  /** Delete the current item */
  env.registerHandler('{#screen/id}-delete-item', function (action, mnode) {
    var dnode = mnode.getDataNode();
    var addr = dnode.getAddress();
    if (confirm('Are you sure you want to delete: ' + addr)) {
      dnode.getDataBridge().remove(addr);
    }
  });

  env.registerHandler('{#screen/id}-select-item', function (action, tnode) {
    var screen = env.screens.get('{#screen/addr}');
    var cwd = screen.tree.getCwd();
    var mnode = cwd.getNodeByData(tnode.getDataNode());
    if (mnode) {
      mnode.setAsCwd();
      mnode.select();
    }
  });

  env.registerHandler('{#screen/id}-edit-item', function (action, tnode) {
    env.dialogs.get('{#screen/id}-properties').show(tnode);
    /*
    var dnode = tnode.getDataNode();
    var schema = tnode.getSchema();
    env.invokeHandler('edit-modeled-data', dnode, schema);
    */
  });

});
