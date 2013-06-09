/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;

  var CParameters = js.impl.Parameters;

  var _defaultParameters = {
    'min_height': 0,
    'min_width': 0,
    'resize_height': true,
    'resize_width': true
  };

  _package.ResizeElement = function (targetElement, handleElement) {
    CParameters.call(this, js.util.clone(_defaultParameters));
    this.targetElement = js.dom.getElement(targetElement);
    this.handleElement = js.dom.getElement(handleElement);
    this.mask = new js.lsn.Mask({opacity:0,cursor:'s-resize'});
    this.dims = {
      h: js.dom.getHeight(this.targetElement),
      w: js.dom.getWidth(this.targetElement)
    };
    this.dragHandle = new js.lsn.DragHandle(handleElement, {
      'onMouseMove': [this.onMouseMove, this],
      'onMouseDown': [this.onMouseDown, this],
      'onMouseUp': [this.onMouseUp, this]
    });
    js.dom.setStyle(handleElement, 'cursor', 's-resize');
  };

  var _proto = _package.ResizeElement.prototype = js.lang.createMethods(
    CParameters
  );

  _proto.onMouseMove = function (event, dh) {
    js.dom.stopEvent(event);
    if (this.getParameter('resize_height')) {
      var h = Math.max(this.dims.h + dh.delta_y, this.getParameter('min_height'));
      js.dom.setStyle(this.targetElement, 'height', h + 'px');
    }
    if (this.getParameter('resize_width')) {
      var w = Math.max(this.dims.w + dh.delta_x, this.getParameter('min_width'));
      js.dom.setStyle(this.targetElement, 'width', w + 'px');
    }
  };

  _proto.onMouseDown = function (event, dh) {
    js.dom.stopEvent(event);
    this.dims.h = js.dom.getHeight(this.targetElement);
    this.dims.w = js.dom.getWidth(this.targetElement);
    if (!this.getParameter('min_height')) {
      this.setParameter('min_height', this.dims.h);
    }
    if (!this.getParameter('min_width')) {
      this.setParameter('min_width', this.dims.w);
    }
    this.mask.show();
  };

  _proto.onMouseUp = function (event, dh) {
    js.dom.stopEvent(event);
    this.mask.hide();
  };

});
