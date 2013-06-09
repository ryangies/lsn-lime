js.extend('lsn.ext.dde.markers', function (js) {
  /** Base class for Markers */

  this.Base = function (dde, pelem) {
    this.dde = dde;
    this.attrs = null;
    this.menu = new js.lsn.ext.dde.PopupMenu(dde);
    this.maskType = 'normal'; // css class applied to the mask layer
    this.modified = false; // data has bee modified
    this.images = [];
    this.editor = null; // set in derived class
    this.pelem = pelem || dde.ui.markers;
    this.adjust = {x:0, y:0};
  };

  var Base = this.Base.prototype = js.lang.createMethods();

  Base.getBoundingBox = js.lang.createAbstractFunction();

  Base.getType = function () {
    return 'unknown';
  };

  Base.getEditor = js.lang.createAbstractFunction();

  Base.getAttributes = function () {
    return this.attrs;
  };

  Base.getAttribute = function (key) {
    return this.attrs ? this.attrs.getString(key) : undefined;
  };

  Base.createImage = function (fn, w, h, l, t) {
    var basePath = "[#:html:url '../images/markers']";
    var elem = this.dde.js.dom.createElement('img', {
      'src': basePath + '/' + fn,
      'onClick': [this.onClick, this],
//    'onDblClick': [this._onDblClick, this],
      'onMouseOver': [this.onMouseOver, this],
      'onMouseOut': [this.onMouseOut, this],
      'class': 'dde-marker',
      'width': w,
      'height': h,
      'style': {
        'position': 'absolute',
        'cursor': 'pointer'
      }
    });
    this.images.push({'elem': elem, 'offsetLeft': l, 'offsetTop': t});
    this.pelem.appendChild(elem);
  };

/*
 * The code for handling a double-click works, however something is wrong
 * because with it the normal click event doesn't always show the mask
 * correctly.
 *
 * Should hold off as the right thing to do here is probably to implement
 * a right-click menu.
 *
 * The intention of the double-click is to jump to the editHTML (see
 * ContentMarker.js) dialog.

  Base._onClick = function (event) {
    js.dom.setTimeout(this.doClick, 250, this, [event]);
  };

  Base._onDblClick = function (event) {
    this.isDblClick = event;
  };

  Base.doClick = function (event) {
    if (this.isDblClick) {
      event = this.isDblClick;
      this.isDblClick = undefined;
      return this.onDblClick(event);
    } else {
      return this.onClick(event);
    }
  };

*/

  Base.onClick = function (event) {
    if (!this.dde.editor) {
      this.dde.setMaskType(this.maskType);
      this.dde.showMask(this);
      this.dde.select(this);
    }
  };

  Base.onDblClick = function (event) {
  };

  Base.onMouseOver = function (event) {
    if (!this.dde.editor) {
      this.dde.setMaskType(this.maskType);
      this.dde.showMask(this);
    }
  };

  Base.onMouseOut = function (event) {
    if (!this.dde.editor) {
      this.dde.hideMask();
    }
  };

  Base.refresh = function () {
    var box = this.getBoundingBox();
    if (box.visible) {
      for (var i = 0, img; img = this.images[i]; i++) {
        var l = box.left + img.offsetLeft + this.dde.body_x + this.adjust.x;
        var t = box.top + img.offsetTop + this.dde.body_y + this.adjust.y;
        l = js.util.asInt(l, true);
        t = js.util.asInt(t, true);
        this.dde.js.dom.setStyle(img.elem, 'display', 'block');
        this.dde.js.dom.setStyle(img.elem, 'left', l + 'px');
        this.dde.js.dom.setStyle(img.elem, 'top', t + 'px');
      }
    } else {
      for (var i = 0, img; img = this.images[i]; i++) {
        this.dde.js.dom.setStyle(img.elem, 'display', 'none');
      }
    }
  };

  Base.remove = function () {
    for (var i = 0, img; img = this.images[i]; i++) {
      this.dde.js.dom.removeElement(img.elem);
    }
    this.images = [];
  };

});

/*
  this.menu.show(event);
  if (!this.menu.active) this.dde.hideMask();
*/
