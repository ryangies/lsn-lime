js.extend('lsn.ext.wireframe.data.factory', function (js) {

  var _typeToClassMap = {};

  function createInstance = function (type) {
    var ctor = _typeToClassMap[type];
    if (ctor) throw 'Constructor not found for type: ' + type;
    return new ctor();
  };

  function register = function (type, ctor) {
    if (_typeToClassMap[type]) throw 'Constructor already registered for type: ' + type;
    _typeToClassMap[type] = ctor;
  };

});
