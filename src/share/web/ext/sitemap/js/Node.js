/** @namespace ext.sitemap */
js.extend('ext.sitemap', function (js) {

  var CFilesystemNode = js.ext.share.filesystem.Node;

  var CNode = this.Node = function () {
    CFilesystemNode.apply(this, arguments);
  };

  var _proto = this.Node.prototype = js.lang.createMethods(
    CFilesystemNode
  );

/* ========================================================================
 * Overridden Methods
 * ======================================================================== */

  /**
   * @function createNode
   */

  _proto.createNode = function (data) {
    return new CNode(data, this.tree);
  };

  /**
   * @function sortCompare
   */

  _proto.sortCompare = function (a, b) {
    if (!(js.util.defined(a) && js.util.defined(b))) return;
    var av = a.data.getIndex();
    var bv = b.data.getIndex();
    var rv = av - bv;
    return rv;
  };

  /**
   * @function canDisplay
   */

  _proto.canDisplay = function () {
    return this.data && this.data.isDataContainer();
//  return this.data.getKey().indexOf('.') != 0;
  };

  _proto.canExpand = function () {
    return this.getType() == 'category';
  };

  /**
   * @function getName
   * Must return a sv that can .tie (see ListView)
   */

  _proto.getName = function () {
    return this.data.getValue('.name');
  };

  /**
   * @function getIconPath
   */

  _proto.getIconPath = function () {
    var type = this.data.getValue('.type') || 'category';
    return '/res/icons/16x16/sitemap/' + type + '.png';
  };

  /**
   * @function getType
   */

  _proto.getType = function () {
    return this.data.getValue('.type') || 'category';
  };

  /**
   * @function getTargetAddress
   */

  _proto.getTargetAddress = function () {
    var result = [];
    var node = this;
    while (node && node !== node.rootNode) {
      result.push(node.data.getKey());
      node = node.parentNode;
    }
    result.push('/');
    return js.data.addr_join(result.reverse());
  };

  /**
   * @function getCrumbPath
   */

  _proto.getCrumbPath = function () {
    var name = [];
    var node = this;
    while (node && node !== this.rootNode) {
      name.unshift(node.getName());
      node = node.parentNode;
    }
    return name.join(' > ');
  };

/* ========================================================================
 * Local Methods
 * ======================================================================== */

});
