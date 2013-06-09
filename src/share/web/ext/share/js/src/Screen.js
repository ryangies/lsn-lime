/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;
  var CHandlerPool = js.action.HandlerPool;

  /**
   * @class Screen
   *
   * The hide/show method used is to toggle the class `screen-hidden`. This is
   * used in preference to add/removing the root element from the DOM as that
   * approach causes unwanted side affects. For example, the screen may still
   * be running, i.e., manipulating its elements. Or, it may be in the middle
   * of an upload...
   *
   * @param props <Hash> Properties (usually taken from `desktop.hf`)
   * @param props.elem <String> Id of the screen's root element
   * @param props.addr <String> URI of the screen AND its unique screen name
   */

  this.Screen = function (props) {
    js.util.overlay(this, props);
    CActionDispatcher.apply(this);
    CHandlerPool.apply(this);
    this.fxDuration = 50;
    this.fxShow = null;
    this.fxHide = null;
    this.uiRoot = null;
  };

  var _proto = this.Screen.prototype = js.lang.createMethods(
    CActionDispatcher,
    CHandlerPool
  );

  _proto.getName = function () {
    return this.addr;
  };

  _proto.show = function (appendTo, cb) {
    if (!this.uiRoot) {
      this.uiRoot = js.dom.getElement(this.elem);
      this.fxShow = new js.fx.effects.Opacify(this.uiRoot, 0, 1, this.fxDuration);
      this.fxHide = new js.fx.effects.Opacify(this.uiRoot, 1, 0, this.fxDuration);
    }
    js.dom.setOpacity(this.uiRoot, 0);
    js.dom.removeClassName(this.uiRoot, 'screen-hidden');
    this.fxShow.start([function () {
      this.dispatchClassAction('onShow', this);
      env.dispatchAction('onUpdateTitle', this.name);
      if (cb) js.lang.callback(cb);
    }, this]);
  };

  _proto.hide = function (cb) {
    this.fxHide.start([function () {
      js.dom.addClassName(this.uiRoot, 'screen-hidden');
      this.dispatchClassAction('onHide', this);
      if (cb) js.lang.callback(cb);
    }, this]);
  };

  _proto.load = function (params) {
    this.dispatchClassAction('onLoad', this, [params]);
  };

});
