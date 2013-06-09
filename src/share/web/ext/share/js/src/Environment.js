/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;
  var CLayout = js.lsn.layout.ViewportLayout;
  var CPrompt = js.lsn.ui.Prompt;
  var CHandlerPool = js.action.HandlerPool;
  var CSharedArray = js.ext.share.SharedArray;

  /**
   * @class Environment
   */

  this.Environment = function () {
    CActionDispatcher.apply(this);
    CHandlerPool.apply(this);
    this.layout = new CLayout();
    this.status = new CPrompt();
    this.screens = new js.ext.share.ui.SwitchList();
    this.dialogs = new js.ext.share.ObjectCache();
    this.initiators = new js.ext.share.SortedNode();
    this.hub = js.hubb.getInstance();
    this.schemas = new js.ext.share.data.model.SchemaLoader();
    this.layout.addActionListener('onPageLoad', this.onPageLoad, this);
    this.localStorage = new js.dom.LocalStorage();
    js.ext.share.data.loadHandlers(this);
  };

  var _proto = this.Environment.prototype = js.lang.createMethods(
    CActionDispatcher,
    CHandlerPool
  );

  _proto.registerHandler = function (name, handler, initiator) {
    //js.console.log('registerHandler', name, arguments.length);
    var handler = CHandlerPool.prototype.registerHandler.call(this, name, handler);
    if (initiator) this.registerInitiator(initiator);
    return handler;
  };

  _proto.registerInitiator = function (initiator) {
    this.initiators.insertChild(initiator);
  };

  /**
   * @function onPageLoad
   */

  _proto.onPageLoad = function (action) {
    var l = new js.http.Location();
    var addr = l.pathname.replace(/[^\/]+$/, '');
    var screen = this.screens.get(addr) || this.screens.getAt(0);
    if (screen) {
      this.screens.select(screen);
    }
    //this.hub.startAutoRefresh();
  };

  _proto.showLoading = function () {
    try {
      this.dialogs.get('status-loading').show();
    } catch (ex) {
    }
  };

  _proto.hideLoading = function () {
    try {
      this.dialogs.get('status-loading').hide();
    } catch (ex) {
    }
  };

  /**
   * @function openBrowserTab
   */

  _proto.openBrowserTab = function (url, name, features) {
    js.window.open(url, name, features);
  };

  _proto.openExtension = function () {
  };

  _proto.setPreference = function (realm, key, value) {
    var obj = this.localStorage.getObject(realm) || {};
    obj[key] = value;
    this.localStorage.setObject(realm, obj);
    return value;
  };

  _proto.getPreference = function (realm, key) {
    var obj = this.localStorage.getObject(realm) || {};
    return obj[key];
  };

  _proto.removePreference = function (realm, key) {
    var obj = this.localStorage.getObject(realm) || {};
    delete obj[key];
  };

});
