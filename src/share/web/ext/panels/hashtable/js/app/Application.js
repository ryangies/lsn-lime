js.extend('lsn.hashtable.app', function (js) {

  var CApplication = js.lsn.app.Application;

  this.Application = function (config) {
    CApplication.apply(this);
    this.config = config;
    this.schema = null;
    this.model = new js.lsn.hashtable.model.Root();
    this.model.addActionListener('load', this.doModelLoad, this);
    this.model.addActionListener('loadError', this.doModelLoadError, this);
    this.model.addActionListener('create', this.doModelCreate, this);
    this.model.addActionListener('select', this.doModelSelect, this);
    this.model.addActionListener('deselect', this.doModelDeselect, this);
    this.model.addActionListener('stored', this.doModelStored, this);
    this.model.addActionListener('remove', this.doModelRemove, this);
    this.listView = new js.lsn.hashtable.view.ListView(this);
    this.listView.addActionListener('select', this.doListSelect, this);
    this.editView = new js.lsn.hashtable.view.EditView(this);
    this.editView.addActionListener('fixup', this.doEditFixup, this);
  };

  var Application = this.Application.prototype = js.lang.createMethods(
    CApplication
  );

  /** overrides CApplication */
  Application.onPageLoad = function (event) {
    CApplication.prototype.onPageLoad.apply(this, arguments);
    this.showLoading('Fetching data');
    this.model.load(this.config.target, this.config.schema);
  };

  /** overrides CApplication */
  Application.onPageUnload = function (event) {
    this.listView.detach();
    this.editView.detach();
    this.model.unload();
  };

  Application.doModelLoad = function (action, model) {
    this.schema = model.meta;
    if (this.schema) {
      this.listView.attach();
      this.editView.attach();
    }
    this.hideLoading();
    if (this.model.firstChild) this.model.firstChild.select();
  };

  Application.doModelLoadError = function (action, model) {
    this.hideLoading();
    this.alert('An error occurred while loading');
  };

  Application.doModelCreate = function (action, node) {
    this.listView.addItem(node);
  };

  Application.doModelSelect = function (action, node) {
    this.editView.select(node);
  };

  Application.doModelDeselect = function (action, node) {
    this.editView.deselect();
  };

  Application.doModelStored = function (action) {
    this.notify('Saved');
  };

  Application.doModelRemove = function (action, node) {
    this.editView.deselect();
    var sibling = node.getAttribute('select_sibling');
    if (sibling) sibling.select();
  };

  Application.doMenuCreate = function (action) {
    this.model.fetchNewNode();
  };

  Application.doListSelect = function (action, item) {
    if (this.model.isModified()) {
      this.confirm('Save changes?', [function (answer, item) {
        if (answer) {
          this.model.store(function () {
            item.node.select();
          });
        } else {
          item.node.select();
        }
      }, this, [item]]);
    } else {
      item.node.select();
    }
  };

  Application.doEditFixup = function (action) {
    this.notify('Some values have been set to their default and you should save these changes.');
  };

  Application.doEditSave = function (action) {
    if (this.model.isModified()) {
      this.model.store();
    } else {
      this.notify('Up to date (no save needed).');
    }
  };

  Application.doEditCancel = function (action) {
    this.model.getSelected().deselect();
  };

  Application.doEditMoveUp = function (action) {
    this.model.getSelected().lower();
  };

  Application.doEditMoveDown = function (action) {
    this.model.getSelected().raise();
  };

  Application.doEditDelete = function (action) {
    this.confirm('Delete this item?', [function (yn) {
      if (yn) this.model.removeSelected();
    }, this]);
  };

});
