ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CAttributeEditor = ecma.lsn.ext.dde.AttributeEditor;

  this.ImageEditor = function () {
    CAttributeEditor.apply(this, arguments);
    this.hyperlink = null;
    this.evtLoad = null;
  };

  var ImageEditor = this.ImageEditor.prototype = ecma.lang.createMethods(
    CAttributeEditor
  );

  ImageEditor.isHyperlinked = function () {
    return this.hyperlink ? true : false;
  };

  ImageEditor.begin = function () {
    this.evtLoad = new this.dde.js.dom.EventListener(
      this.target, 'load', this.onImageLoad, this
    );
    return CAttributeEditor.prototype.begin.apply(this, arguments);
  };

  ImageEditor.end = function () {
    this.evtLoad.remove();
    return CAttributeEditor.prototype.end.apply(this, arguments);
  };

  ImageEditor.initControls = function () {
    var result = CAttributeEditor.prototype.initControls.apply(this, arguments);
    // Image controls may have a special resize attribute
    if (!this.marker.attrs.get('resize')) {
      var ctrl = new ecma.lsn.ext.dde.AttributeControl('resize');
      ctrl.hidden = this.opts.get('resize') == 'no-resize';
      result.push(ctrl);
    }
    return result;
  };

  ImageEditor.onReady = function () {
    CAttributeEditor.prototype.onReady.apply(this, arguments);
    var ctrl = this.getControl('src');
    ctrl.addActionListener('onChange', this.onSelectImage, this);
  };

  ImageEditor.onSelectImage = function (action) {
    this.setAttribute('src', this.getValue('src'));
    this.setAttribute('resize', this.getValue('resize'));
  };

  ImageEditor.onImageLoad = function (event) {
    this.dde.refreshMasks();
  };

  ImageEditor.setAttribute = function (attr, value) {
    if (attr.match(/^(href|target|rev|rel)$/)) {
      var a = this.target.parentNode;
      if (a.tagName != 'A') {
        throw('images with attribute "' + attr + '" must be a child of an anchor element');
      }
      this.dde.js.dom.setAttribute(a, attr, value);
    } else if (attr == 'resize') {
      try {
        var src = this.getAttribute('src');
        src += '?resize=' + (value || '1:1');
        var req = new ecma.http.Request(src);
        req.method = 'HEAD';
        req.submit(null, [function (req) {
          var headers = req.xhr.getAllResponseHeaders();
          var w = req.xhr.getResponseHeader('X-Image-DisplayWidth');
          var h = req.xhr.getResponseHeader('X-Image-DisplayHeight');
          if (w && h) {
            this.dde.js.dom.setAttribute(this.target, 'width', w);
            this.dde.js.dom.setAttribute(this.target, 'height', h);
          }
          this.dde.refreshMasks();
        }, this]);
      } catch (ex) {
        // Remote image
      }
      if (value) {
        this.dde.js.dom.setAttribute(this.target, 'src', src);
      }
    } else {
      CAttributeEditor.prototype.setAttribute.apply(this, arguments);
    }
  };

  ImageEditor.getAttribute = function (attr) {
    var result = null;
    if (attr.match(/^(href|target|rev|rel)$/)) {
      var a = this.target.parentNode;
      if (a.tagName != 'A') {
        throw('images with attribute "' + attr + '" must be a child of an anchor element');
      }
      result = this.dde.js.dom.getAttribute(a, attr);
      result = ecma.util.defined(result) ? decodeURIComponent(result) : '';
    } else if (attr == 'src') {
      var src = this.dde.js.dom.getAttribute(this.target, 'src');
      var parts = src.split('?', 2);
      if (parts.length == 2 && parts[1].match(/resize=([\dx]+)/)) {
        result = parts[0];
      } else {
        result = src;
      }
      result = decodeURIComponent(result);
    } else if (attr == 'resize') {
      var src = this.dde.js.dom.getAttribute(this.target, 'src');
      var parts = src.split('?', 2);
      if (parts.length == 2) {
        var m = parts[1].match(/resize=([\dx]+)/);
        if (m) result = m[1];
      }
    } else {
      result = CAttributeEditor.prototype.getAttribute.apply(this, arguments);
    }
    return result;
  };

});
