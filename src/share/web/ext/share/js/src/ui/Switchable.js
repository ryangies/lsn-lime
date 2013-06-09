/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _hidden   = {'display': 'none',   'visibility': 'hidden'};
  var _visible  = {'display': 'block',  'visibility': 'visible'};

  var CActionDispatcher = js.action.ActionDispatcher;

  this.Switchable = function (name, elemId) {
    CActionDispatcher.apply(this);
    this.name = name;
    this.elemMarker = null;
    this.elemId = elemId;
    this.elem = null;
  };

  var _proto = this.Switchable.prototype = js.lang.createMethods(
    CActionDispatcher
  );

  _proto.getName = function () {
    return this.name;
  };

  _proto.getElement = function () {
    return this.elem || js.dom.getElement(this.elemId);
  };

  _proto.reload = function () {
    this.executeClassAction('onReload', this, arguments);
  };

  _proto.show = function (appendTo, cb) {
    if (!appendTo) appendTo = js.dom.getBody();
    if (!this.elem) {
      this.elem = js.dom.getElement(this.elemId);
      if (this.elem.parentNode) {
        this.elemMarker = js.dom.createElement('#comment');
        js.dom.insertBefore(this.marker, this.elem);
      }
      js.dom.appendChild(appendTo, this.elem);
    } else {
//    js.dom.appendChild(appendTo, this.elem);
      js.dom.setOpacity(this.elem, 1);
      js.dom.setStyles(this.elem, _visible);
    }
    this.executeClassAction('onShow', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.hide = function (cb) {
    if (this.elemMarker) {
      js.dom.insertAfter(this.elem, this.marker);
    } else {
      js.dom.setOpacity(this.elem, 0);
      js.dom.setStyles(this.elem, _hidden);
//    js.dom.removeElement(this.elem);
    }
    this.executeClassAction('onHide', this);
    if (cb) js.lang.callback(cb);
  };

  _proto.load = function (/*...*/) {
    this.executeClassAction('onLoad', this, arguments);
    this.executeClassAction('onReady', this);
  };

});
