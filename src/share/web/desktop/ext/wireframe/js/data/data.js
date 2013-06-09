js.extend('lsn.ext.wireframe.data', function (js) {

  var _tagNameToClassMap = {};

  function normalizeTagName = (tagName) {
    if (!js.util.defined(tagName)) return tagName;
    return tagName.toUpperCase();
  };

  this.register = function (tagName, klass) {
    tagName = normalizeTagName(tagName);
    return _tagNameToClassMap[tagName] = klass;
  };

  this.getAllowedTypes = function () {
    var keys = [];
    for (var k in _tagNameToClassMap) {
      keys.push(k);
    }
    return keys;
  };

  this.createInstance = function (tagName) {
    tagName = normalizeTagName(tagName);
    var klass = _tagNameToClassMap[tagName];
    if (!klass) {
      throw 'Unhandled tag name: ' + tagName;
    }
    return new klass(tagName);
  };

  this.fromObject = function (obj) {
    var node = js.lsn.ext.wireframe.data.createInstance(obj.tagName);
    node.id = obj.id;
    node.data = obj.data;
    for (var i = 0, child; child = obj.childNodes[i]; i++) {
      node.appendChild(this.fromObject(child));
    }
    return node;
  };

});
