js.extend('lsn.ext.wireframe.data', function (js) {

  var CNode = this.Node;

  this.DocumentNode = function (typeName) {
    CNode.apply(this);
    this.tagName = 'DOCUMENT';
  };

  var _proto = this.DocumentNode.prototype = js.lang.createMethods(CNode);

  _proto.toString = function () {
    return this.tagName;
  };

});
