/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var _package = this;

  /**
   * @class ObjectFactory
   */

  _package.ObjectFactory = function () {
    this.objectMap = {};
    this.defaultObject = null;
  };

  var _proto = _package.ObjectFactory.prototype = js.lang.createMethods();

  /**
   * @function get
   */

  _proto.get = function (key) {
    return this.objectMap[key] || this.defaultObject;
  };

  /**
   * @function set
   */

  _proto.set = function (key, ctor, bDefault) {
    if (bDefault) this.setDefault(ctor);
    return this.objectMap[key] = ctor;
  };

  /**
   * @function setDefault
   */

  _proto.setDefault = function (ctor) {
    return this.defaultObject = ctor;
  };

  /**
   * @function createObject
   */

  _proto.createObject = function (/*key, ...*/) {
    var args = js.util.args(arguments);
    var key = args.shift();
    var ctor = this.get(key);
    return js.lang.createObject(ctor, args);
  };

});
