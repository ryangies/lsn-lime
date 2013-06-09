/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CNode = js.data.Node;

  _package.FormNode = function (data) {
    CNode.call(this, data);
  };

  var _proto = _package.FormNode.prototype = js.lang.createMethods(
    CNode
  );

  _proto.createNode = function (data) {
    return js.ext.share.input.fields.factory.createObject(data.type, data, this);
  };

  _proto.onAdopt = function (node) {
  };

  _proto.getElements = function () {
    return [];
  };

  _proto.getName = function () {
    try {
      return this.data.name;
    } catch (ex) {
      return this.id;
    }
  };

});
