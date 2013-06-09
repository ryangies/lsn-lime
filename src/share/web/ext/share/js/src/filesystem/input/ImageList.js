/** @namespace ext.share.filesystem.input */
js.extend('ext.share.filesystem.input', function (js) {

  var _package = this;
  var CInputBase = js.ext.share.input.InputArray;

  var _proto = js.lang.createMethods(CInputBase);

  _package.ImageList = function (params, elem) {
    CInputBase.apply(this, [params, elem]);
  };

  _package.ImageList.prototype = _proto;

  js.ext.share.input.factory.set('image-list', _package.ImageList);

});
