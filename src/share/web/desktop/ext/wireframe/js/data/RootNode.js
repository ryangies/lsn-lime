js.extend('lsn.ext.wireframe.data', function (js) {

  var CNode = this.Node;

  this.RootNode = function (typeName) {
    CNode.apply(this);
    this.tagName = 'ROOT';
  };

  var RootNode = this.RootNode.prototype = js.lang.createMethods(CNode);

  js.lsn.ext.wireframe.data.register('ROOT', this.RootNode);

  RootNode.toString = function () {
    return this.tagName;
  };

  RootNode.fromObject = function (obj) {
    this.id = obj.id;
    this.data = obj.data;
    this.removeAllChildren();
    for (var i = 0, child; child = obj.childNodes[i]; i++) {
      this.appendChild(js.lsn.ext.wireframe.data.fromObject(child));
    }
    return this;
  };

});
