/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;

  _package.View = function () {
    this.elements = this.createElements();
  };

  var _proto =
      _package.View.prototype = js.lang.createMethods(
      );

  _proto.getElements = function () {
    return this.elements;
  };

  _proto.createElements = function () {
    return [];
  };

  _proto.removeElements = function () {
    js.dom.removeElements(this.getElements());
  };

  _proto.unload = function () {
    this.removeElements();
  };

});
