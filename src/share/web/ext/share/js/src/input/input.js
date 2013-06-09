/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CObjectFactory = js.ext.share.ObjectFactory;

  _package.Factory = function () {
    CObjectFactory.apply(this, arguments);
  };

  var _proto = _package.Factory.prototype = js.lang.createMethods(
    CObjectFactory
  );

  _proto.createObject = function (/*key, ...*/) {
    var args = js.util.args(arguments);
    var key = args.shift();
    args[0] = js.util.overlay({'type': key}, args[0]);
    var ctor = this.get(key);
    if (!ctor) throw new Error('Missing input class for: ' + key);
    return js.lang.createObject(ctor, args);
  };

  _package.factory = new _package.Factory();

});
