js.extend('lsn.ext.dde.markers', function (js) {

  function _getBoundingBox (elem, box) {
    if (!js.dom.node.isElement(elem)) return;
    var pos = new this.dde.js.lsn.ext.dde.Position(elem);
//  var pos = this.dde.js.dom.getElementPosition(elem);
    box.x1 = box.x1 == null ? pos.left : Math.min(box.x1, pos.left);
    box.y1 = box.y1 == null ? pos.top : Math.min(box.y1, pos.top);
    box.x2 = Math.max(box.x2, this.dde.js.dom.getRight(elem));
    box.y2 = Math.max(box.y2, this.dde.js.dom.getBottom(elem));
    box.visible = box.visible ? pos.visible : false;
    _getOverflowBounds.call(this, elem, box);
  }

  function _getOverflowBounds (elem, box) {
    if (!js.dom.node.isElement(elem)) return;
    if (elem.tagName == 'IMG') {
      box.x2 = Math.max(box.x2, this.dde.js.dom.getRight(elem));
      box.y2 = Math.max(box.y2, this.dde.js.dom.getBottom(elem));
    }
    var child = elem.firstChild;
    while (child) {
      _getOverflowBounds.call(this, child, box);
      child = child.nextSibling;
    }
  }

  function _getPrecedingElement (elem) {
    if (elem.previousSibling) {
      if (js.dom.node.isElement(elem.previousSibling)) {
        return elem.previousSibling;
      } else {
        return _getPrecedingElement.call(this, elem.previousSibling);
      }
    } else if (elem.parentNode && elem.parentNode !== elem) {
      if (js.dom.node.isElement(elem.parentNode)) {
        return elem.parentNode;
      } else {
        return _getPrecedingElement.call(this, elem.parentNode);
      }
    } else {
      return undefined;
    }
  }

  var CBase = js.lsn.ext.dde.markers.Base;
  var BlockMarker = js.lang.Methods(CBase);

  this.BlockMarker = function (dde, cluster) {
    CBase.call(this, dde);
    this.maskType = 'block';
    this.cluster = cluster;
    this.createImage("marker7a.png", 19, 6, -3, -6),
    this.createImage("marker7b.png", 6, 19, -6, 0),
    this.refresh();
  };

  this.BlockMarker.prototype = BlockMarker;

  BlockMarker.getType = function () {
    return 'block';
  }

  BlockMarker.getEditor = function () {
    if (this.editor) return this.editor;
    var cluster = this.cluster;
    var group = cluster.parentNode;
    var attrs = group.data.begin.attrs;
    if (attrs['from']) {
      this.editor = new js.lsn.ext.dde.BlockListEditor(this.dde, this);
    } else {
      this.editor = new js.lsn.ext.dde.BlockEditor(this.dde, this);
    }
    return this.editor;
  };

  BlockMarker.getBoundingBox = function () {
    var box = {x1: null, y1: null, x2: 0, y2: 0, visible: true}
    var node = this.cluster.firstChild;
    if (!node) {
      // No child elements, stub marker allows adding blocks
      var cnode = this.cluster.data.cnode;
      if (cnode) {
        var elem = _getPrecedingElement.call(this, cnode);
        if (elem) {
          _getBoundingBox.call(this, elem, box);
          var h = js.dom.getHeight(elem);
//        var m = js.util.asInt(js.dom.getStyle(elem, 'margin-bottom'));
//        Hmm, two situations maybe, one when each item is a child
//        (like LI's inside a OL) and another when they are peers (like
//        DIV's after an H1). The margin adjustment looks right for the latter,
//        but not the former...
//        box.y1 += h + m;
          box.y1 += h;
          box.x2 = box.x1;
          box.y2 = box.y1;
        }
      }
    } else {
      while (node) {
        var elem = node.data;
        _getBoundingBox.call(this, elem, box);
        node = node.nextSibling;
      }
    }
    box.x1 = js.util.asInt(box.x1);
    box.y1 = js.util.asInt(box.y1);
    return {
      top: box.y1,
      left: box.x1,
      width: box.x2 - box.x1,
      height: box.y2 - box.y1,
      visible: box.visible
    };
  };

});
