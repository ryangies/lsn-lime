js.extend('desktop.ext.edit.data', function (js) {

  var _imgReady     = '[#`./images/blank.gif`]';
  var _imgActive    = '[#`./images/saving.gif`]';
  var _imgComplete  = '[#`./images/checkmark.gif`]';

  this.StatusIcon = function (node) {
    this.elem = js.dom.createElement('img', {
      'src': _imgReady,
      'width': 16,
      'height': 16,
      'border': 0
    });
    this.ui = [this.elem];
    this.fade = new js.fx.effects.Opacify(this.elem, 1, .25, 1000);
  };

  var _proto = this.StatusIcon.prototype = js.lang.createMethods();

  _proto.getUI = function () {
    return this.ui;
  };

  _proto.showActive = function () {
    js.dom.setOpacity(this.elem, 1);
    js.dom.setAttribute(this.elem, 'src', _imgActive);
  };

  _proto.showComplete = function () {
    js.dom.setOpacity(this.elem, 1);
    js.dom.setAttribute(this.elem, 'src', _imgComplete);
    js.dom.setTimeout(this.fade.start, 1000, this.fade);
  };

  _proto.showReady = function () {
    js.dom.setOpacity(this.elem, 1);
    js.dom.setAttribute(this.elem, 'src', _imgReady);
  };

});
