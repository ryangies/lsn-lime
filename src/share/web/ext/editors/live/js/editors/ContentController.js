ECMAScript.Extend('lsn.ext.dde', function (js) {

  function _isElem (node) {
    return node && node.nodeType == js.dom.constants.ELEMENT_NODE;
  }

  function _isText (node) {
    return node && node.nodeType == js.dom.constants.TEXT_NODE;
  }

  var proto = {};

  this.ContentController = function () {
    this.target = undefined;
  };

  this.ContentController.prototype = proto;

  proto.attach = function (elem) {
    this.target = elem;
    this.exec('styleWithCSS', false);
  };

  proto.detach = function () {
    this.target = undefined;
  };

  proto.isHome = function () {
    var range = this.getRange();
    if (!range) return false;
    // XXX                                                  WRONG vvvvvvvvv
    return range.startContainer === this.target && range.startOffset === this.target
      && range.endContainer == 0 && range.endOffset == 0 ? true : false;
  };

  proto.getFocusElement = function () {
    var range = this.getRange();
    if (!range) return;
    var endNode = js.dom.node.isElement(range.endContainer)
      ? range.endOffset
        ? range.endContainer.childNodes[range.endOffset - 1]
        : range.endContainer
      : js.dom.node.isText(range.endContainer)
        ? range.endContainer.parentNode
        : range.endContainer;
    if (!js.dom.isChildOf(endNode, this.target)) {
      return null;
//      throw 'Selection outside of target';
    }
    while (endNode && !_isElem(endNode) && endNode !== this.target) {
      endNode = endNode.parentNode;
    }
    return endNode;
  };

  proto.getElementStack = function (elem) {
    var result = [];
    if (elem) {
      if (!js.dom.isChildOf(elem, this.target)) return result;
    } else {
      elem = this.getFocusElement();
    }
    while (elem) {
      if (_isElem(elem)) result.push(elem);
      if (elem === this.target) break;
      elem = elem.parentNode;
    }
    return result;
  };

  proto.getContainerStack = function () {
    var result = [];
    var elem = this.target;
    while (elem) {
      if (_isElem(elem)) result.push(elem);
      elem = elem.parentNode;
    }
    return result;
  };

  proto.getContainingParagraph = function () {
    var stack = this.getElementStack();
    var elem = null;
    for (var i = 0, node; node = stack[i]; i++) {
      if (node.tagName.match(/^(p|h[1-6]|div|t[dh])$/i)) {
        elem = node;
        break;
      }
    }
    return elem;
  };

  proto.getElementsByTagName = function (tagName) {
    var result = [];
    var stack = this.getElementStack();
    for (var i = 0, elem; elem = stack[i]; i++) {
      if (elem.tagName.toLowerCase() == tagName.toLowerCase()) {
        result.push(elem);
      }
    }
    return result;
  };

  proto.insertElement = function (elem) {
    var range = this.getRange();
//  if (!range.collapsed) range = this.deleteRangeElements(range);
    if (!range.collapsed) range.deleteContents()
    if (!range.collapsed) throw 'Could not collapse range for insertion';
    var container = range.startContainer;
    var offset = range.startOffset;
    switch (container.nodeType) {
      case js.dom.constants.ELEMENT_NODE:
        var currentNode = container.childNodes[offset] || container;
        if (currentNode === this.target) {
          if (currentNode.childNodes.length > 0) {
            currentNode.insertBefore(elem, currentNode.childNodes[0]);
          } else {
            currentNode.appendChild(elem);
          }
        } else {
          js.dom.insertBefore(elem, currentNode);
        }
        break;
      case js.dom.constants.TEXT_NODE:
        var prefix = container.nodeValue.substr(0, offset);
        var suffix = container.nodeValue.substr(offset);
        var nextNode = js.dom.createElement('#text', {'nodeValue':suffix});
        container.nodeValue = prefix;
        js.dom.insertChildrenAfter(container, [elem, nextNode]);
        break;
      default:
        throw 'No implementation for selected nodeType';
    }
    this.focusEnd(elem);
  };

  proto.selectNodeContents = function (elem) {
    if (!js.dom.isChildOf(elem, this.target)) {
      throw 'Element outside of target';
    }
    var sel = this.getSelection();
    sel.removeAllRanges();
    var range = this.createRange();
    range.selectNodeContents(elem);
    sel.addRange(range);
    return sel;
  };

  proto.selectNode = function (elem) {
    if (!js.dom.isChildOf(elem, this.target)) {
      throw 'Element outside of target';
    }
    var range = this.createRange();
    range.selectNode(elem);
    var sel = this.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return sel;
  };

  proto.selectElement = proto.selectNode;
  proto.selectElementContents = proto.selectNodeContents;

  proto.focusStart = function (elem) {
    try {
      var range = this.getRange();
      range.selectNode(elem);
      range.collapse(true);
      this.setRange(range);
    } catch (ex) {
      ///js.console.log(ex);
    }
  };

  proto.focusEnd = function (elem) {
    try {
      var range = this.getRange();
      range.selectNode(elem);
      range.collapse(false);
      this.setRange(range);
    } catch (ex) {
      ///js.console.log(ex);
    }
  };

  proto.focusBefore = function (elem) {
    try {
      var node = elem.previousSibling;
      if (!node) {
        node = elem.parentElement;
        if (!node || (node == this.target)) {
          this.target.focus();
        } else if (js.dom.isChildOf(node, this.target)) {
          this.focusStart(node);
        }
        return;
      } else {
        while (node.hasChildNodes()) {
          node = node.lastChild;
        }
      }
      if (js.dom.node.isElement(node) && node.tagName == 'BR') {
        this.focusBefore(node);
      } else {
        this.focusEnd(node);
      }
    } catch (ex) {
      ///js.console.log(ex);
    }
  };

  proto.focusAfter = function (elem) {
    try {

      var next = null;
      var node = elem;

      while (!next && node !== this.target) {
        next = node.nextSibling;
        node = node.parentNode;
      }

      if (next) {
        this.focusStart(next);
      } else {
        this.focusEnd(node);
      }

    } catch (ex) {
      ///js.console.log(ex);
    }
  };

  proto.insertHTML = function (html) {
    this.exec('insertHTML', html);
  };

  proto.exec = function (cmd, value) {
    if (this.isTargetSelected()) this.selectContents();
    if (cmd == 'createLink') {
      if (!value) return;
      var sel = this.getSelection();
      var a = js.dom.createElement('a', {'href': value});
      if (sel.isCollapsed) {
        js.dom.setAttribute(a, 'innerHTML', value);
        this.insertElement(a);
      } else {
        var range = this.getRange();
        range.surroundContents(a);
      }
      this.selectElement(a);
    } else {
      js.document.execCommand(cmd, false, value);
    }
  };

  proto.isTargetSelected = function () {
    var sel = this.getSelection();
    return !sel.isCollapsed && sel.anchorNode === this.target && sel.anchorOffset == 0
      && sel.focusNode === this.target && sel.focusOffset == this.target.childNodes.length;
  };

  proto.selectContents = function () {
    this.getSelection().selectAllChildren(this.target);
  };

  proto.focus = function () {
    var sel = this.getSelection();
    if (sel.rangeCount == 0 || 
        !sel.anchorNode ||
        !sel.focusNode ||
        !(sel.anchorNode === this.target || js.dom.isChildOf(sel.anchorNode, this.target)) ||
        !(sel.focusNode === this.target || js.dom.isChildOf(sel.focusNode, this.target))
        ) {
      this.target.focus();
      sel = js.window.getSelection();
      try {
        sel.collapseToStart();
      } catch (ex) {
      }
    }
    if (sel.rangeCount == 0) throw 'cannot obtain focus';
    return sel;
  };

  //http://stackoverflow.com/questions/1426815/javascript-ranging-gone-wrong 
  proto.getSelection = function () {
    if (!this.target) throw 'not attached';
    var sel = js.window.getSelection();
    if (!sel.anchorNode) {
      this.target.focus();
      sel = js.window.getSelection();
      try {
        sel.collapseToStart();
      } catch (ex) {
      }
    }
    if (sel.rangeCount > 1) {
      for (var i = 1; i < sel.rangeCount; i++) {
        sel.removeRange(sel.getRangeAt(i));
      }
    }
    return sel;
  };

  proto.getRange = function () {
    var sel = this.getSelection();
    if (!(sel && sel.rangeCount)) return;
    var range = sel.getRangeAt(0);
    var trunk = range.commonAncestorContainer;
    if (!trunk || (trunk !== this.target && !js.dom.isChildOf(trunk, this.target))) {
      throw 'Selection outside of target';
    }
/*
 * BUGGY, does not work when range.endContainer == range.childNodes.length
 *
    var beginNode = js.dom.node.isElement(range.startContainer)
      ? range.startContainer.childNodes[range.startOffset]
      : js.dom.node.isText(range.startContainer)
        ? range.startContainer.parentNode
        : range.startContainer;
    var endNode = js.dom.node.isElement(range.endContainer)
      ? range.endContainer.childNodes[range.endOffset]
      : js.dom.node.isText(range.endContainer)
        ? range.endContainer.parentNode
        : range.endContainer;
    if (!js.dom.isChildOf(beginNode, this.target)
        && !js.dom.isChildOf(endNode, this.target)) {
      throw 'Selection outside of target';
    }
*/
    return range;
  };

  proto.setRange = function (range) {
    var sel = this.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return sel;
  };

  proto.createRange = function () {
    return js.document.createRange();
  };

  proto.getRanges = function () {
    var ranges = []
    var sel = this.getSelection();
    for (var i = 0; i < sel.rangeCount; i++) {
      var range = sel.getRangeAt(i);
      ranges.push([
        range.startContainer,
        range.startOffset,
        range.endContainer,
        range.endOffset
      ]);
    }
    return ranges;
  };

  proto.setRanges = function (ranges) {
    var sel = this.getSelection();
    sel.removeAllRanges();
    for (var i = 0; i < ranges.length; i++) {
      var range = this.createRange();
      range.setStart(ranges[i][0], ranges[i][1]);
      range.setEnd(ranges[i][2], ranges[i][3]);
      sel.addRange(range);
    }
    return sel;
  };

  proto.getCursorStack = function () {
    var result = [];
    var range = this.getRange();
    range.collapse(true);
    result.push(range);
    var elem = range.startContainer;
    while (elem) {
      result.push(elem);
      if (elem === this.target) break;
      elem = elem.parentNode;
    }
    return result;
  };

  proto.setCursor = function (cursorStack) {
    var range = cursorStack[0];
    if (range.startContainer && range.startContainer.parentNode) {
      var sel = this.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      for (var i = 1, node; node = cursorStack[i]; i++) {
        if (node.parentNode) {
          this.selectNode(node).collapseToStart();
          break;
        }
      }
    }
  };

  // Like range.deleteContents() however we remove the elements, not just their
  // contents.
  //
  //  Note, range.deleteContents may delete the nodes too, strange browser
  //  behavior... Currently this function is not used (5/11/2011).
  //
  proto.deleteRangeElements = function (range) {

    if (range.collapsed) return range;

    var startNode = null;
    var previousNode = null;
    var startContainer = range.startContainer;
    var startOffset = range.startOffset;
    if (js.dom.node.isElement(startContainer)) {
      startNode = startContainer.childNodes[startOffset];
      previousNode = startNode.previousSibling;
    } else if (js.dom.node.isText(startContainer)) {
      // Split text node
      var prefix = startContainer.nodeValue.substr(0, startOffset);
      var suffix = startContainer.nodeValue.substr(startOffset);
      startContainer.nodeValue = prefix;
      startNode = js.dom.createElement('#text', {'nodeValue': suffix});
      previousNode = startContainer;
      js.dom.insertAfter(startNode, startContainer);
    } else {
      throw('Unhandled node type');
    }

    var endNode = null;
    var nextNode = null;
    var endContainer = range.endContainer;
    var endOffset = range.endOffset;
    if (js.dom.node.isElement(endContainer)) {
// XXX - endOffset can be == childNodes.length
      endNode = endContainer.childNodes[endOffset];
      nextNode = endNode.nextSibling;
    } else if (js.dom.node.isText(endContainer)) {
      // Split text node
      var prefix = endContainer.nodeValue.substr(0, endOffset);
      var suffix = endContainer.nodeValue.substr(endOffset);
      endContainer.nodeValue = prefix;
      endNode = endContainer;
      nextNode = js.dom.createElement('#text', {'nodeValue': suffix});
      js.dom.insertAfter(nextNode, endNode);
    } else {
      throw('Unhandled node type');
    }

    function removeUntil (node, endNode) {
      var next = null;
      while (node) {
        while (node.hasChildNodes()) {
          var stop = removeUntil(node.firstChild, endNode);
          if (stop) return true;
        }
        next = node.nextSibling || node.parentElement.nextSibling;
        js.dom.removeElement(node);
        if (node === endNode) return true;
        node = next;
      }
      return false;
    }

    removeUntil(startNode, endNode);

    var range = this.createRange();
    if (previousNode) {
      range.setStart(previousNode, 0);
      range.setEnd(previousNode, this.getEndOffset(previousNode));
      range.collapse(false);
    } else if (nextNode) {
      range.setStart(nextNode, 0);
      range.setEnd(nextNode, this.getEndOffset(nextNode));
      range.collapse(true);
    } else {
      range.setStart(startContainer, 0);
      range.setEnd(startContainer, this.getEndOffset(startContainer));
      range.collapse(true);
    }
    return range;

  };

  proto.getEndOffset = function (node) {
    if (js.dom.node.isElement(node)) {
      return node.hasChildNodes() ? node.childNodes.length - 1 : 0;
    } else if (js.dom.node.isText(node)) {
      return node.nodeValue.length - 1;
    } else {
      return 0;
    }
  };

});

/*

  proto.getFocusElement = function () {
    var sel = this.getSelection();
    if (sel.rangeCount == 0) return this.target;
    var range = sel.getRangeAt(0);
    var sc = range.startContainer;
    var so = range.startOffset;
    var ec = range.endContainer;
    var eo = range.endOffset;
    var cc = range.commonAncestorContainer;
    var node = null;
    if (!sel.isCollapsed) {
      if (sc === ec) {
        if (!_isText(sc)) {
          var e1 = sc.childNodes[so];
          var e2 = ec.childNodes[eo];
          node = e1.nextSibling === e2 ? e1 : sc;
        } else {
          node = sc;
        }
      } else if (_isText(sc) && so == sc.length) {
        node = ec;
      } else if (so > 0 && (_isText(sc) && _isText(ec))) {
        node = sc;
      } else if (so > 0 && sc.nextSibling && _isElem(sc.nextSibling)) {
        node = sc.nextSibling;
      } else if (!ec || ec === this.target) {
        node = sc;
      } else if (sc && !sc.previousSibling && ec && !ec.nextSibling && sc.parentNode === ec.parentNode) {
        node = sc.parentNode;
      }
      if (node) {
        while (node.firstChild) {
          if (node === ec) break;
          if (!_isElem(node.firstChild)) break;
          node = node.firstChild;
        }
      }
    } else {
      node = sc && _isElem(sc)
        ? so > 0
          ? sc.childNodes[so]
          : sc
        : cc;
    }
    while (node && !_isElem(node)) {
      if (node === this.target) break;
      node = node.parentNode;
    }
    return node;
  };

*/
