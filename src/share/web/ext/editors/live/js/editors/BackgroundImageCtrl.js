js.extend('lsn.ext.dde', function (js) {

  var Package = this;
  var CImage = js.lsn.ext.dde.ImageCtrl;

  Package.BackgroundImageCtrl = function (dde, target) {
    CImage.apply(this, arguments);
  };

  var Proto = Package.BackgroundImageCtrl.prototype = js.lang.createMethods(
    CImage
  );

  // Wrap the URI in CSS url syntax
  function srcToCssUrl (src) {
    return 'url(' + src + ')';
  }

  // Unwrap the URI from CSS url syntax
  function cssUrlToSrc (cssUrl) {
    var parts = cssUrl.match(/^url\(['"]?([^'")]+)['"]?\)/);
    return parts ? parts[1] : cssUrl;
  }

  function unwrapNumbers (cssValue) {
    var result = [];
    var parts = cssValue.split(/\s/);
    for (var i = 0; i < parts.length; i++) {
      result.push(parseInt(parts[i], 10));
    }
    return result;
  }

  Proto.readTarget = function () {
    var bgImage = this.dde.js.dom.getStyle(this.target, 'background-image');
    var bgSize = this.dde.js.dom.getStyle(this.target, 'background-size');
    var bgPos = this.dde.js.dom.getStyle(this.target, 'background-position');
    bgImage = cssUrlToSrc(bgImage);
    bgSize = unwrapNumbers(bgSize);
    bgPos = unwrapNumbers(bgPos);
    this.orig.src = new this.dde.js.http.Location(bgImage);
    this.orig.w = bgSize[0];
    this.orig.h = bgSize[1];
    this.orig.x = bgPos[0];
    this.orig.y = bgPos[1];
  };

  Proto.updateTarget = function () {
    this.dde.js.dom.setStyle(this.target, 'background-image',
      srcToCssUrl(this.current.src.getHref()));
    this.dde.js.dom.setStyle(this.target, 'background-size',
      this.current.w + 'px ' + this.current.h + 'px');
    this.dde.js.dom.setStyle(this.target, 'background-position',
      this.current.x + 'px ' + this.current.y + 'px');
    this.dde.refreshMasks();
  };

});
