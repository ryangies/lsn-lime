/** @namespace ext.share */
js.extend('ext.share', function (js) {

  /**
   * @class ObjectCache - Singleton named objects.
   *
   *  var cache = new ObjectCache();        // Somewhere the cache is created
   *  cache.register('dialog1', CDialog);   // Elsewhere constructors are registered with a name
   *  cache.get('dialog1');                 // Runtime code then fetches the instance
   *
   * The first time `dialog1` is requested via `get`, it is constructed by 
   * calling:
   *
   *  new CDialog();
   *
   * Note that no parameters can be passed to the object constructor. To 
   * perform initialization, the named object can be registered with a callback:
   *
   *  cache.register('dialog2', CDialog, initCallback);
   *
   * When such a callback exists, it will be called immediately after 
   * construction, passing the instance as the first argument. For example:
   *
   *  function initCallback (obj) {
   *    obj.load().
   *  }
   *
   */

  this.ObjectCache = function () {
    this.seeds = {};
    this.instances = {};
  };

  var _proto = this.ObjectCache.prototype = js.lang.createMethods();

  /**
   * @function register
   */

  _proto.register = function (name, ctor, cb) {
    if (name in this.instances) delete this.instances[name];
    this.seeds[name] = [ctor, cb];
  };

  /**
   * @function get
   */

  _proto.get = function (name) {
    var obj = this.instances[name];
    if (!obj) {
      var seed = this.seeds[name];
      if (!seed) throw new TypeError('Named object does not exist: ' + name);
      obj = this.instances[name] = new seed[0]();
      if (seed[1]) {
        js.lang.callback(seed[1], obj)
      }
    }
    return obj;
  }

});
