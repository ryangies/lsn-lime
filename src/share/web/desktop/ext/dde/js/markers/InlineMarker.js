ECMAScript.Extend('lsn.ext.dde.markers', function (ecma) {

  var CBase = ecma.lsn.ext.dde.markers.Base;

  /**
   * @class InlineMarker
   * Screen marker for editable content.
   */

  this.InlineMarker = function (dde, elem, attrs) {
    CBase.apply(this, [dde, dde.ui.submarkers]);
    this.elem = elem;
    if (elem.tagName == 'IMG') {
      this.attrs = new ecma.data.HashList(
        'src', null,
        'alt', null,
        'border', null,
        'align', null
      );
      if (elem.parentNode && elem.parentNode.tagName == 'A') {
        this.attrs.set('href', null);
        this.attrs.set('rel', null);
      }
    } else {
      throw 'no implementation for editing such an element';
    }
    this.createImage("marker7c.png", 16, 16, 0, 0);
    this.refresh();
  };

  var InlineMarker = this.InlineMarker.prototype = ecma.lang.Methods(CBase);

  InlineMarker.getBoundingBox = function () {
    var pos = this.dde.js.dom.getElementPosition(this.elem);
    if (pos.width < 10) {
      pos.width = 16;
      pos.right = pos.left + 16;
    }
    if (pos.height < 10) {
      pos.height = 16;
      pos.bottom = pos.top + 16;
    }
    return pos;
  };

  InlineMarker.onClick = function (event) {
    this.editor = new ecma.lsn.ext.dde.InlineImageEditor(this.dde, this);
    this.editor.begin();
  };

  InlineMarker.onMouseOver = function (event) {
  };

  InlineMarker.onMouseOut = function (event) {
  };

});
