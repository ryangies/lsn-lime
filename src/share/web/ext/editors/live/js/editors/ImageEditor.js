js.extend('lsn.ext.dde', function (js) {

  var CAttributeEditor = js.lsn.ext.dde.AttributeEditor;

  this.ImageEditor = function () {
    CAttributeEditor.apply(this, arguments);
    this.hyperlink = null;
    this.evtLoad = null;
  };

  var ImageEditor = this.ImageEditor.prototype = js.lang.createMethods(
    CAttributeEditor
  );

  ImageEditor.isHyperlinked = function () {
    return this.hyperlink ? true : false;
  };

  ImageEditor.begin = function () {
    this.evtLoad = new this.dde.js.dom.EventListener(
      this.target, 'load', this.onImageLoad, this
    );
    this.detectHyperlink();
    var klass = this.opts.get('zoom') == 'zoom'
      ? js.lsn.ext.dde.BackgroundImageCtrl
      : js.lsn.ext.dde.ImageCtrl
    this.imageCtrl = new klass(this.dde, this.target, this.opts);
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
      var ctrl = new js.lsn.ext.dde.AttributeControl('resize');
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

  ImageEditor.onCancel = function () {
    CAttributeEditor.prototype.onCancel.apply(this, arguments);
    this.imageCtrl.reset();
    this.imageCtrl.updateTarget();
  };

  ImageEditor.onSelectImage = function (action) {
    this.setAttribute('src', this.getValue('src'));
    this.setAttribute('resize', this.getValue('resize'));
  };

  ImageEditor.onImageLoad = function (event) {
    this.dde.refreshMasks();
  };

  ImageEditor.setAttribute = function (attr, value) {
    if (!js.util.defined(value)) value = '';
    if (attr.match(/^(href|target|rev|rel)$/)) {
      this.enableHyperlink();
      this.dde.js.dom.setAttribute(this.hyperlink, attr, value);
    } else if (attr == 'resize') {
      this.imageCtrl.setResize(value);
    } else if (attr == 'src') {
      this.imageCtrl.setSourcePath(encodeURI(value));
    } else {
      CAttributeEditor.prototype.setAttribute.apply(this, arguments);
    }
  };

  ImageEditor.getAttribute = function (attr) {
    var result = null;
    if (attr.match(/^(href|target|rev|rel)$/)) {
      if (this.isHyperlinked()) {
        result = this.dde.js.dom.getAttribute(this.hyperlink, attr);
        result = js.util.defined(result) ? decodeURIComponent(result) : '';
      } else {
        result = '';
      }
    } else if (attr == 'src') {
      result = this.imageCtrl.getSourcePath();
      result = decodeURIComponent(result);
    } else if (attr == 'resize') {
      result = this.imageCtrl.getResize();
    } else {
      result = CAttributeEditor.prototype.getAttribute.apply(this, arguments);
    }
    return result;
  };

  ImageEditor.getAttributeValue = function (attr) {
    return attr == 'src'
      ? this.opts.get('resize') == 'no-resize'
        ? this.imageCtrl.getSourcePath()
        : this.imageCtrl.getSource()
      : this.getAttribute(attr);
  };

  ImageEditor.detectHyperlink = function () {
    var parentNode = this.target.parentNode;
    this.hyperlink = parentNode.tagName == 'A' ? parentNode : null;
  };

  /**
   * @function enableHyperlink
   *
   * Wrap the target image in an anchor tag
   */

  ImageEditor.enableHyperlink = function () {
    if (this.isHyperlinked()) return;
    this.hyperlink = this.dde.js.dom.createElement('A');
    this.dde.js.dom.insertBefore(this.target, this.hyperlink)
    this.dde.js.dom.appendChild(this.hyperlink, this.target);
  };

  /**
   * @function disableHyperlink
   *
   * Remove the anchor wrapper.
   */

  ImageEditor.disableHyperlink = function () {
    if (!this.isHyperlinked()) return;
    this.dde.js.dom.removeElementOrphanChildren(this.hyperlink);
    this.hyperlink = null;
  };

});
