js.extend('desktop.ext.edit.data', function (js) {

  var _proto = {};
  
  this.ResizeTextarea = function (textarea) {
    this.textarea = js.dom.getElement(textarea);
    this.mask = new js.lsn.Mask({opacity:0,cursor:'s-resize'});
    this.dims = {h: undefined};
    this.elem = js.dom.createElement('div.rszta.wide');
    this.handle = new js.lsn.DragHandle(this.elem, {
      'onMouseMove': [this.onMouseMove, this],
      'onMouseDown': [this.onMouseDown, this],
      'onMouseUp': [this.onMouseUp, this]
    });
    this.ui = [this.elem]
  };

  this.ResizeTextarea.prototype = _proto;

  _proto.getUI = function () {
    return this.ui;
  };

  _proto.onMouseMove = function (event, dh) {
    js.dom.stopEvent(event);
    var h = Math.max(this.dims.h + dh.delta_y, 60);
    js.dom.setStyle(this.textarea, 'height', h + 'px');
  };

  _proto.onMouseDown = function (event, dh) {
    js.dom.stopEvent(event);
    this.dims.h = js.dom.getHeight(this.textarea);
    this.mask.show();
  };

  _proto.onMouseUp = function (event, dh) {
    js.dom.stopEvent(event);
    this.mask.hide();
  };

});
