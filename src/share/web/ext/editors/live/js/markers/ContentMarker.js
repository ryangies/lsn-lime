js.extend('lsn.ext.dde.markers', function (js) {

  var baseClass = js.lsn.ext.dde.markers.Base;
  var proto = js.lang.Methods(baseClass);

  /**
   * @class ContentMarker
   * Screen marker for editable content.
   */

  this.ContentMarker = function (dde, elem) {
    baseClass.apply(this, [dde]);
    this.elem = elem;
    this.pos = new this.dde.js.lsn.ext.dde.Position(elem);
    var attrStr = this.dde.js.dom.getAttribute(elem, '_lsn_ds');
    this.attrs = js.lsn.ext.dde.parseAttributes(attrStr);
    var optsStr = this.dde.js.dom.getAttribute(elem, '_lsn_opts');
    this.opts = js.lsn.ext.dde.parseAttributes(optsStr);
    this.createImage("marker7c.png", 16, 16, 0, 0);
    this.refresh();
  },

  this.ContentMarker.prototype = proto;

  proto.getOption = function (key) {
    return this.opts ? this.opts.getString(key) : undefined;
  };

  proto.getOptions = function (key) {
    return this.opts ? this.opts.toObject() : undefined;
  };

/*
  proto.onDblClick = function (event) {
    if (!this.dde.editor) {
      this.dde.select(this, 'editHTML');
    }
  };
*/

  proto.getType = function () {
    return js.util.grep('innerHTML', this.attrs.keys())
      ? 'text'
      : this.elem.tagName == 'IMG'
        ? 'image'
        : 'attribute';
  };

  proto.getEditor = function () {
    try {
      if (this.getOption('tagName') == 'ce:style') {
        return new js.lsn.ext.dde.StyleEditor(this.dde, this);
      } else if (this.getOption('input')) {
        return new js.lsn.ext.dde.InputEditor(this.dde, this);
      } else if (js.util.grep('innerHTML', this.attrs.keys())) {
        if (!this.dde.editors.TextEditor) {
          this.dde.editors.TextEditor = new js.lsn.ext.dde.TextEditor(this.dde)
        }
        this.dde.editors.TextEditor.setMarker(this);
        return this.dde.editors.TextEditor;
      } else if (this.elem.tagName == 'IMG') {
        return new js.lsn.ext.dde.ImageEditor(this.dde, this);
      } else {
        return new js.lsn.ext.dde.AttributeEditor(this.dde, this);
      }
    } catch (ex) {
      alert(ex);
    }
  },

  proto.getBoundingBox = function () {
    return this.pos.refresh();
    /*
    var pos = this.dde.js.dom.getElementPosition(this.elem);
    if (pos.width < 10) {
      pos.width = 16;
      pos.right = pos.left + 16;
    }
    if (pos.height < 10) {
      pos.height = 16;
      pos.bottom = pos.top + 16;
    }
    var imgList = this.elem.getElementsByTagName('img');
    for (var i = 0, img; img = imgList[i]; i++) {
      pos.height = Math.max(pos.height, this.dde.js.dom.getHeight(img));
      pos.width = Math.max(pos.width, this.dde.js.dom.getWidth(img));
    }
    return pos;
    */
  };

});
