/** @namespace ext.sitemap.input */
js.extend('ext.sitemap.input', function (js) {

  var _package = this;
  var CSelectBase = js.ext.share.filesystem.input.Select;

  var CSelect = _package.Select = function (params) {
    if (!params) params = {};
    params.rootAddress = params.category
      ? '/web/data/sitemap.hf' + params.category
      : '/web/data/sitemap.hf';
    CSelectBase.apply(this, [params]);
  };

  var _proto = CSelect.prototype = js.lang.createMethods(CSelectBase);

  js.ext.share.input.factory.set('select-sitemap-entry', CSelect);

  _proto.constructTree = function (dnode) {
    return new js.ext.share.filesystem.Tree(dnode, js.ext.sitemap.Node);
  };

  _proto.constructView = function (layerName, tree) {
    return new js.ext.sitemap.view.SelectView(layerName, tree);
  };

/*
        js.console.log("TODO - handle uuid in sitemap");
*/

  _proto.localizeAddress = function (addr) {
    var parts = addr.match(/^uuid:(.*)/);
    if (parts) {
      var uuid = parts[1];
      var node = this.tree.rootNode.walk(function (n) {
        var dnode = n.getDataNode();
        if (dnode.isDataContainer() && dnode.getString('.uuid') === uuid) {
          return n;
        }
      });
      return node ? node.getDataNode().getAddress() : addr;
    } else {
      return CSelectBase.prototype.localizeAddress.apply(this, arguments);
    }
  };

});
