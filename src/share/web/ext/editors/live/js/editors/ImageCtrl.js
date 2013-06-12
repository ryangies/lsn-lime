js.extend('lsn.ext.dde', function (js) {

  var Package = this;

  /**
   * @class ImageCtrl
   *
   * Controls getting and setting the srs and resize attributes of an image.
   * The resize attribute is actually a query-parameter of the src URI and
   * this controller abstracts it into two logical parts.
   *
   * There are two scenarios for resizing:
   *
   *  1) The template defines the size and resizing method
   *  2) The user specifies the size and resizing method
   *
   * The resizing method is either letterbox or center+zoom
   */

  Package.ImageCtrl = function (dde, target) {
    this.dde = dde;
    this.target = target;
    this.orig = {};
    this.current = {};
    this.appliedValue = null;
    this.init();
  };

  var Proto = Package.ImageCtrl.prototype = js.lang.createMethods();

  /**
   * @function init
   *
   * Initialize object values.
   */

  Proto.init = function () {
    this.readTarget();
    this.resetCurrentValues();
  };

  /**
   * @function readTarget
   *
   * Read original values from the target element.
   */

  Proto.readTarget = function () {
    var srcAttr = this.dde.js.dom.getAttribute(this.target, 'src');
    this.orig.src = new this.dde.js.http.Location(srcAttr);
    this.orig.w = this.dde.js.dom.getAttribute(this.target, 'width');
    this.orig.h = this.dde.js.dom.getAttribute(this.target, 'height');
    this.orig.x = 0;
    this.orig.y = 0;
  };

  /**
   * @function reset
   * 
   * Restore original (initial) state.
   */

  Proto.reset = function () {
    this.resetCurrentValues();
    this.updateTarget();
  };

  /**
   * @function resetCurrentValues
   *
   * Restore original values.
   */

  Proto.resetCurrentValues = function () {
    for (var k in this.orig) {
      this.current[k] = this.orig[k];
    }
    this.appliedValue = this.getSource();
  };

  /**
   * @function applyChanges
   *
   * Apply user changes (if any) to the target element.
   */

  Proto.applyChanges = function () {
    if (this.appliedValue === this.getSource()) return;
    this.updateTarget();
    this.fetchImageInfo();
    this.appliedValue = this.getSource();
  }

  /**
   * @function updateTarget
   *
   * Update the element according to current values.
   */

  Proto.updateTarget = function () {
    this.dde.js.dom.setAttribute(this.target, 'src', this.current.src.getHref());
    this.setTargetAttribute('width', this.current.w);
    this.setTargetAttribute('height', this.current.h);
    this.dde.refreshMasks();
  };

  /**
   * @function setTargetAttribute
   *
   * Set an attribute value on the target, or remove it if the value is not
   * true.
   */

  Proto.setTargetAttribute = function (attr, value) {
    if (value) {
      this.dde.js.dom.setAttribute(this.target, attr, value);
    } else {
      this.dde.js.dom.removeAttribute(this.target, attr);
    }
  };

  /**
   * @function getSource
   *
   * Get the canonical src of the image.
   */

  Proto.getSource = function () {
    return this.current.src.getHref();
  };

  /**
   * @function getSourcePath
   *
   * Get the src of the image (without resize parameters)
   */

  Proto.getSourcePath = function () {
    return this.current.src.isSameOrigin()
      ? this.current.src.pathname
      : this.current.src.getUri();
  };

  /**
   * @function setSourcePath
   *
   * Set the src for the image (without resize parameters)
   */

  Proto.setSourcePath = function (value) {
    value = new this.dde.js.http.Location(value);
    if (value.isSameOrigin()) { // Same as document
      if (this.current.src.isSameOrigin(value)) {
        this.current.src.pathname = value.pathname;
      } else {
        // We are changing from foreign origin to the local origin.
        this.current.src = value;
        if (!this.getResize()) {
          // In the case that
          // 1) The original was a local origin, with a resize
          // 2) Then a foreign origin was chosen
          // 3) Then a local origin was chosen
          this.setResize(this.orig.src.getParameters().resize);
        }
      }
    } else {
      this.current.src = value;
    }
    this.applyChanges();
  };

  /**
   * @function getResize
   *
   * Get the current resize value.
   */

  Proto.getResize = function () {
    return this.current.src.getParameters().resize;
  };

  /**
   * @function setResize
   *
   * Set the value for resizing the image.
   */

  Proto.setResize = function (value) {
    if (this.current.src.isSameOrigin()) {
      this.current.src.search = value
        ? '?resize=' + value
        : '';
      this.applyChanges();
    }
  };

  /**
   * @class fetchImageInfo
   *
   * Submit a HEAD request to the server, which returns dimension information
   * in the response headers.
   */

  Proto.fetchImageInfo = function () {
    if (this.current.src.isSameOrigin()) {
      var loc;
        loc = this.current.src;
/*
      if (this.getResize()) {
        loc = this.current.src;
      } else {
        loc = new this.dde.js.http.Location(this.current.src);
        loc.addParameter('resize', '1:1');
      }
*/
      var req = new js.http.Request(loc.getHref());
      req.method = 'HEAD';
      req.submit(null, [this.onImageInfo, this]);
    } else {
      js.dom.createElement('IMG', {
        'src': this.getSource(),
        'onLoad': [this.onImageLoad, this]
      });
    }
  };

  /**
   * @function onImageLoad
   *
   * When the user selects an image from a foreign origin, this method is
   * used to discern the width and height.
   *
   * TODO Set resize (letterbox or center+zoom) w/h values
   */

  Proto.onImageLoad = function (event) {
    var img = js.dom.getEventTarget(event);
    this.current.w = img.width;
    this.current.h = img.height;
    this.current.x = 0;
    this.current.y = 0;
    this.updateTarget();
  };

  /**
   * @function onImageInfo
   *
   * When the user selects an image from the local origin, this method
   * is used to discern the width, height and offsets.
   *
   * XXX Offsets only [currently] make sense in our center+zoom scenario,
   * which is handled by the derived BackgroundImageCtrl class.
   */

  Proto.onImageInfo = function (req) {
    this.current.w = parseIntHeader(req, 'X-Image-DisplayWidth');
    this.current.h = parseIntHeader(req, 'X-Image-DisplayHeight');
    this.current.x = parseIntHeader(req, 'X-Image-OffsetLeft');
    this.current.y = parseIntHeader(req, 'X-Image-OffsetTop');
    this.updateTarget();
  };

  function parseIntHeader (req, name) {
    var value = parseInt(req.xhr.getResponseHeader(name), 10);
    return isNaN(value) ? 0 : value;
  }

});
