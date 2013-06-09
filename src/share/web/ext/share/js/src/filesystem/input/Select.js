/** @namespace ext.share.filesystem.input */
js.extend('ext.share.filesystem.input', function (js) {

  var _package = this;
  var CInputBase = js.ext.share.input.InputBase;

  var CSelect = _package.Select = function (params) {
    CInputBase.apply(this, [params]);
    this.elements = this.createElements();
    this.rootAddress = this.getParameter('rootAddress') || '/';
    this.value = this.emptyValue = null;
    this.selectOnLoad = null;
    this.alOnSelect = null;
    this.load();
  };

  var _proto = CSelect.prototype = js.lang.createMethods(CInputBase);

  js.ext.share.input.factory.set('select-filesystem-entry', CSelect);

  _proto.constructTree = function (dnode) {
    return new js.ext.share.filesystem.Tree(dnode);
  };

  _proto.constructView = function (layerName, tree) {
    return new js.ext.share.filesystem.view.SelectView(layerName, tree);
  };

  _proto.createElements = function () {
    this.uiRoot = js.dom.createElement('DIV');
    var paramStyles = this.getParameter('styles');
    if (paramStyles) {
      js.dom.setStyles(this.uiRoot, paramStyles);
    }
    return [this.uiRoot];
  };

  _proto.load = function () {
    if (this.hasLoaded) return;
    env.showLoading();
    env.hub.fetch(this.rootAddress, [function (dnode) {
      if (!dnode) return; // Failed to fetch
      this.tree = this.constructTree(dnode);
      this.selectView = this.constructView('select-view', this.tree);
      this.selectView.setParameter('showThumbnails', this.getParameter('showThumbnails'));
      js.dom.replaceChildren(this.uiRoot, this.selectView.getElements());
      this.tree.rootNode.populate();
      this.tree.rootNode.setAsCwd();
      this.tree.rootNode.expand();
      this.hasLoaded = true;
      if (this.selectOnLoad) {
        var addr = this.selectOnLoad;
        this.selectOnLoad = null;
        this.deserialize(addr);
      } else {
        this.listen();
      }
      this.sync();
      env.hideLoading();
    }, this]);
  };

  _proto.listen = function () {
    if (this.tree) {
      this.alOnSelect = this.tree.addActionListener(
          'onSelect', this.onSelect, this);
    }
  };

  _proto.mute = function () {
    if (this.alOnSelect) {
      this.alOnSelect.remove();
      this.alOnSelect = null;
    }
  };

  _proto.onSelect = function (action, tnode) {
    this.executeAction(action, tnode);
    this.executeClassAction('onChange', this);
  };

  _proto.read = function () {
    try {
      var selected = this.tree.getSelected();
      this.value = selected ? selected.getDataNode() : this.emptyValue;
    } catch (ex) {
    }
    return this;
  };

  _proto.write = function () {
    try {
      this.tree.selectNodeByAddress(this.value.getAddress());
    } catch (ex) {
    }
    return this;
  };

  _proto.deserialize = function (storedValue) {
    try {
      if (!this.hasLoaded) {
        this.selectOnLoad = storedValue;
      } else {
        var addr = this.localizeAddress(storedValue);
        //var node = this.tree.rootNode.getNodeByAddress(data);
        if (addr) {
          this.mute();
          this.tree.selectNodeByAddress(addr, [function () {
            this.listen();
          }, this]);
        } else {
          this.tree.clearSelection();
        }
      }
    } catch (ex) {
      js.error.reportError(ex);
    }
    return this;
  };

  _proto.serialize = function () {
    var value = this.getValue();
    return value ? value.getAddress() : '';
  };

  _proto.localizeAddress = function (addr) {
    if (addr && addr.indexOf(this.rootAddress) != 0) {
      addr = js.data.addr_join(this.rootAddress, addr);
    }
    return addr;
  };

});
