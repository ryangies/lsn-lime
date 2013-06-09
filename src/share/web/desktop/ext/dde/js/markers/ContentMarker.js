ECMAScript.Extend('lsn.ext.dde.markers', function (ecma) {

  var baseClass = ecma.lsn.ext.dde.markers.Base;
  var proto = ecma.lang.Methods(baseClass);

  /**
   * @class ContentMarker
   * Screen marker for editable content.
   */

  this.ContentMarker = function (dde, elem) {
    baseClass.apply(this, [dde]);
    this.elem = elem;
    var attrStr = this.dde.js.dom.getAttribute(elem, '_lsn_ds');
    this.attrs = ecma.lsn.ext.dde.parseAttributes(attrStr);
    var optsStr = this.dde.js.dom.getAttribute(elem, '_lsn_opts');
    this.opts = ecma.lsn.ext.dde.parseAttributes(optsStr);
    this.createImage("marker7c.png", 16, 16, 0, 0);
    this.refresh();
  },

  this.ContentMarker.prototype = proto;

  proto.getOption = function (key) {
    return this.opts ? this.opts.getString(key) : undefined;
  };

/*
  proto.onDblClick = function (event) {
    if (!this.dde.editor) {
      this.dde.select(this, 'editHTML');
    }
  };
*/

  proto.getType = function () {
    return ecma.util.grep('innerHTML', this.attrs.keys())
      ? 'text'
      : this.elem.tagName == 'IMG'
        ? 'image'
        : 'attribute';
  };

  proto.getEditor = function () {
    try {
      if (ecma.util.grep('innerHTML', this.attrs.keys())) {
        if (!this.dde.editors.TextEditor) {
          this.dde.editors.TextEditor = new ecma.lsn.ext.dde.TextEditor(this.dde)
        }
        this.dde.editors.TextEditor.setMarker(this);
        return this.dde.editors.TextEditor;
      } else if (this.elem.tagName == 'IMG') {
        return new ecma.lsn.ext.dde.ImageEditor(this.dde, this);
      } else {
        return new ecma.lsn.ext.dde.AttributeEditor(this.dde, this);
      }
    } catch (ex) {
      alert(ex);
    }
  },

  proto.getBoundingBox = function () {
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
  };

});
