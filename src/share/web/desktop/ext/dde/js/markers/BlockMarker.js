ECMAScript.Extend('lsn.ext.dde.markers', function (ecma) {

  function _getBoundingBox (elem, box) {
    if (!ecma.dom.node.isElement(elem)) return;
    var pos = this.dde.js.dom.getElementPosition(elem);
    box.x1 = box.x1 == null ? pos.left : Math.min(box.x1, pos.left);
    box.y1 = box.y1 == null ? pos.top : Math.min(box.y1, pos.top);
    box.x2 = Math.max(box.x2, this.dde.js.dom.getRight(elem));
    box.y2 = Math.max(box.y2, this.dde.js.dom.getBottom(elem));
    _getOverflowBounds.call(this, elem, box);
  }

  function _getOverflowBounds (elem, box) {
    if (!ecma.dom.node.isElement(elem)) return;
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
      if (ecma.dom.node.isElement(elem.previousSibling)) {
        return elem.previousSibling;
      } else {
        return _getPrecedingElement.call(this, elem.previousSibling);
      }
    } else if (elem.parentNode && elem.parentNode !== elem) {
      if (ecma.dom.node.isElement(elem.parentNode)) {
        return elem.parentNode;
      } else {
        return _getPrecedingElement.call(this, elem.parentNode);
      }
    } else {
      return undefined;
    }
  }

  var CBase = ecma.lsn.ext.dde.markers.Base;
  var BlockMarker = ecma.lang.Methods(CBase);

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
    if (!this.editor) {
      this.editor = new ecma.lsn.ext.dde.BlockEditor(this.dde, this);
    }
    return this.editor;
  };

  BlockMarker.getBoundingBox = function () {
    var box = {x1: null, y1: null, x2: 0, y2: 0}
    var node = this.cluster.firstChild;
    if (!node) {
      var cnode = this.cluster.data.cnode;
      if (cnode) {
        var elem = _getPrecedingElement.call(this, cnode);
        if (elem) {
          _getBoundingBox.call(this, elem, box);
        }
      }
    } else {
      while (node) {
        var elem = node.data;
        _getBoundingBox.call(this, elem, box);
        node = node.nextSibling;
      }
    }
    box.x1 = ecma.util.asInt(box.x1);
    box.y1 = ecma.util.asInt(box.y1);
    return {
      top: box.y1,
      left: box.x1,
      width: box.x2 - box.x1,
      height: box.y2 - box.y1
    };
  };

});
