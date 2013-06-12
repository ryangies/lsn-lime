js.extend('lsn.ext.dde', function (js) {
  
  this.parseAttributes = function (str) {
    var attrs = new js.data.HashList();
    if (!str) str = new String();
    var parts = str.split(';');
    for (var j = 0, part; part = parts[j]; j++) {
      if (!part) continue;
      var kv = part.split('=');
      var key = kv[0];
      var val = kv[1].replace(/^'|'$/g, '');
      attrs.set(key, val);
    }
    return attrs;
  };


});

js.extend('lsn.ext.dde', function (js) {

  var URL_ELEMS = {
    'A': ['href'],
    'IMG': ['src'],
    'OBJECT': ['src']
   };

  this.ReplaceText = function (substr, newSubstr) {
    this.substr = substr;
    this.newSubstr = newSubstr;
  };

  var _proto = this.ReplaceText.prototype = js.lang.createMethods();

  _proto.perform = function (elem, scope) {
    if (!this.substr) return;
    var bURLs = scope ? scope == 'urls' || scope == 'both' : false;
    var bText = scope ? scope == 'both' || scope == 'text' : true;
    var node = elem.firstChild;
    while (node) {
      var next = node.nextSibling;
      switch (node.nodeType) {
        case js.dom.constants.ELEMENT_NODE:
          if (bURLs && URL_ELEMS[node.tagName]) {
            for (var i = 0, attr; attr = URL_ELEMS[node.tagName][i]; i++) {
              var attrValue = js.dom.getAttribute(node, attr);
              if (attrValue && typeof(attrValue.replace == 'function')) {
                js.dom.setAttribute(node, attr,
                  attrValue.replace(this.substr, this.newSubstr));
              }
            }
          }
          this.perform(node, scope); // recurse
          break;
        case js.dom.constants.TEXT_NODE:
          if (bText) {
            node.nodeValue = node.nodeValue.replace(this.substr, this.newSubstr);
          }
        default:
          break;
      }
      node = next;
    }
    return elem;
  };

});

ECMAScript.Extend('lsn.ext.dde', function (js) {

  var _watchInterval = 50; // Milliseconds to check for changes
  var _maxWatchCount = 10; // Maximum number of checks before bailing

  var _MODE_FORMATTED = 0;
  var _MODE_UNFORMATTED = 1;

  var proto = {};

  this.Clipboard = function (cc, editor) {
    this.cc = cc; // ContentController for the editable element
    this.editor = editor; // Editor which can receive focus
    this.target = null; // Focus element (which will receive the paste)
    this.pasteEvent = null;
    this.mode =
    this.defaultMode = _MODE_FORMATTED;
  };

  this.Clipboard.prototype = proto;

  proto.attach = function (elem) {
    this.target = elem;
    this.pasteEvent = new js.dom.EventListener(
      this.target, 'paste', this.onPaste, this
    );
  };

  proto.detach = function () {
    if (this.pasteEvent) this.pasteEvent.remove();
  };

  proto.onPaste = function (event) {
    js.console.log('onPaste');
    new PasteFilter(this);
    this.setNextMode(this.defaultMode);
  };

  proto.setNextMode = function (mode) {
    this.mode = mode || _MODE_FORMATTED;
  };

  proto.getMode = function () {
    return this.mode;
  };

  /** 
   * PasteFilter
   */

  function PasteFilter (clipboard) {
    this.cc = clipboard.cc;
    this.editor = clipboard.editor;
    this.target = clipboard.target;
    this.mode = clipboard.getMode();
    this.watchCount = 0; // Limits watch mechanism
    this.watchId = null; // Timeout identifier for clearing
    this.scrubber = new js.dom.Scrubber(js);
    this.cursor = null;
    this.begin();
  }

  PasteFilter.prototype.begin = function () {
    this.editor.stopMonitor();
    this.cursor = js.dom.createElement('#comment=PASTE');
    this.cc.insertElement(this.cursor);
    var tagName = this.mode == _MODE_UNFORMATTED ? 'TEXTAREA' : 'DIV';
    this.bucket = js.dom.createElement(tagName, {
      'contentEditable': 'true',
      'style': {
        'position': 'fixed',
        'top': '0'
      }
    });
    js.dom.setOpacity(this.bucket, 0);
    js.dom.getBody().appendChild(this.bucket);
    this.bucket.focus();
    this.beginWatch();
  };

  PasteFilter.prototype.afterPaste = function () {
    if (this.mode == _MODE_UNFORMATTED) {
      var node = js.dom.createElement('#text', {
        'nodeValue': this.bucket.value
      });
      js.dom.insertBefore(node, this.cursor);
      this.endPaste();
      return;
    }
    try {
      // Scrub the pasted fragment
      this.scrubber.scrub(this.bucket);
      // Move pasted nodes from paste bucket to target
      var last = null;
      while (this.bucket.hasChildNodes()) {
        var node = this.bucket.firstChild;
        try {
          if (node === last) throw 'Element not inserted';
          js.dom.insertBefore(node, this.cursor);
          last = node;
        } catch (ex) {
          if (this.bucket.firstChild === node) {
            // Could not insert node in hierarchy
            js.dom.removeElementOrphanChildren(this.bucket.firstChild);
          }
        }
      }
    } catch (ex) {
      js.console.log(ex);
    } finally {
      // Ensure the DOM is valid in the target context
      this.scrubber.collapse(this.target);
      this.endPaste();
    }
  };

  PasteFilter.prototype.endPaste = function () {
    try {
      this.editor.focus();
      this.cc.focusBefore(this.cursor);
    } catch (ex) {
      js.console.log(ex);
    } finally {
      js.dom.removeElements(this.bucket, this.cursor);
      this.editor.startMonitor();
    }
  };

  PasteFilter.prototype.hasChanged = function () {
    return this.mode == _MODE_UNFORMATTED
      ? this.bucket.value != ''
      : this.bucket.hasChildNodes();
  };

  PasteFilter.prototype.watchForPaste = function () {
    js.console.log('watching for paste', this.watchCount);
    if (this.watchCount < _maxWatchCount) {
      this.watchCount++;
      if (!this.hasChanged()) {
        this.watchId = js.dom.setTimeout(this.watchForPaste, _watchInterval, this);
        return;
      }
    }
    js.dom.setTimeout(this.endWatch, _watchInterval, this);
  };

  PasteFilter.prototype.beginWatch = function () {
    this.watchCount = 0;
    this.watchId = js.dom.setTimeout(this.watchForPaste, _watchInterval, this);
  };

  PasteFilter.prototype.endWatch = function () {
    js.dom.clearTimeout(this.watchId);
    try {
      if (!this.hasChanged()) {
        this.endPaste();
      } else {
        this.afterPaste();
      }
    } finally {
      this.watchCount = 0;
      this.watchId = null;
    }
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CComboBox = js.hubb.ui.ComboBox;
  var proto = js.lang.createMethods(CComboBox);

  this.FileCombo = function () {
    CComboBox.apply(this);
  };

  this.FileCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CComboBox = js.hubb.ui.ComboBox;
  var proto = js.lang.createMethods(CComboBox);

  this.ImageCombo = function () {
    CComboBox.apply(this);
  };

  this.ImageCombo.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

});

ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var _package = this;

  function _getTop (elt) {
    return _getOffset(elt, 'Top', true) - _getScroll(elt, 'Top', true);
  }

  function _getLeft (elt) {
    return _getOffset(elt, 'Left', true) - _getScroll(elt, 'Left', true);
  }

  function _getOffset (elt, which, bubbles) {
    if (!elt) return 0;
    var result = elt['offset' + which] || 0;
    if (bubbles) {
      result += _getOffset(elt.offsetParent, which, bubbles);
    }
    return isNaN(result) ? 0 : result;
  }

  function _getScroll (elt, which, bubbles) {
    if (!elt || elt.tagName == 'BODY') return 0;
    var result = elt['scroll' + which] || 0;
    if (bubbles) {
      result += _getScroll(elt.parentNode, which, bubbles);
    }
    return isNaN(result) ? 0 : result;
  }

  function _getBounds (elt) {
    var t = _getOffset(elt, 'Top', true) - _getScroll(elt.parentNode, 'Top', true);
    var l = _getOffset(elt, 'Left', true) - _getScroll(elt.parentNode, 'Left', true);
    var w = _getOffset(elt, 'Width');
    var h = _getOffset(elt, 'Height');
    var result = {
      'top': t,
      'left': l,
      'width': w,
      'height': h,
      'bottom': t + h,
      'right': l + w
    };
    return result;
  }

  function _isWithinBounds (pos, bounds, boundingElt) {
    var display = ecma.dom.getStyle(boundingElt, 'display');
    var overflow = ecma.dom.getStyle(boundingElt, 'overflow');
    if (/inline/.test(display) || "visible" == overflow) {
      return true;
    }
    return ((pos.top < bounds.top)
        || (pos.top > bounds.bottom)
        || (pos.left < bounds.left)
        || (pos.left > bounds.right)) ? false : true;
  }

  function _isVisible (pos) {
    if (!_isVisibleByStyle(pos.elt)) return false;
    var elt = pos.elt.parentNode;
    while (ecma.dom.node.isElement(elt) && elt.parentNode &&
        (elt.parentNode.tagName != 'HTML')) {
      if (!_isVisibleByStyle(elt)) return false;
      if (!_isWithinBounds(pos, _getBounds(elt), elt)) return false;
      elt = elt.parentNode;
    }
    return true;
  }

  function _isVisibleByStyle (elt) {
    if (ecma.dom.getStyle(elt, 'display') == 'none') return false;
    if (ecma.dom.getStyle(elt, 'visibility') == 'hidden') return false;
    if (ecma.dom.getOpacity(elt) == 0) return false;
    return true;
  }

  /**
   * @class Position
   */

  var _proto;

  _package.Position = function (elt) {
    this.elt = elt;
    this.top = 0;
    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.bottom = 0;
    this.right = 0;
    this.visible = false;
    this.refresh();
  }

  _proto = _package.Position.prototype = ecma.lang.createMethods(
  );

  _proto.refresh = function () {
    this.top = _getTop(this.elt);
    this.left = _getLeft(this.elt);
    this.width = _getOffset(this.elt, 'Width');
    this.height = _getOffset(this.elt, 'Height');
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
    this.visible = _isVisible(this);
    return this;
  };

});

js.extend('lsn.ext.dde', function (js) {

  this.MenuButton = js.lang.createConstructor();

  this.MenuButton.prototype = {

    construct: function (dde, props) {
      this.dde = dde;
      this.props = props;
      this.on = false;
      if (props.label) {
        this.elem = js.dom.createElement('#text', {
          'nodeValue': props.label
        });
      } else if (props.elem) {
        this.elem = js.dom.getElement(props.elem);
      } else if (props.cmd) {
        var className = props['class'];
        if (!className) className = 'button';
        var onClick = props.target && props.target == 'editor'
          ? function (event) {
            js.dom.stopEvent(event);
            if (dde.editor) dde.editor.exec(props.cmd);
            if (dde.editor) dde.editor.focus();
          }
          : function (event) {
            js.dom.stopEvent(event);
            dde.exec(props.cmd);
          };
        var stopEvent = function (event) {
          js.dom.stopEvent(event);
        };
        this.elem = js.dom.createElement('img', {
          'class': className,
          'src': props.icon,
          'alt': props.alt,
          'title': props.alt,
          'onClick': onClick,
          'onFocus': stopEvent,
          'onMouseDown': stopEvent,
          'onMouseUp': stopEvent,
          'style': {'cursor':'pointer'}
        });
      } else if (props.icon) {
        this.elem = js.dom.createElement('img', {
          'class': 'static',
          'src': props.icon,
          'alt': props.alt
        });
      }
      if (props.obj) {
        var klass = js.util.evar(props.obj);
        if (!klass) throw 'Undefined button object: ' + props.obj;
        this.obj = new klass(this, this.elem);
        this.elem = this.obj.getElement();
      }
    },

    getElement: function () {
      return this.elem;
    },

    onShow: function (args) {
      if (this.obj) this.obj.onShow(args);
      if (this.props.state) this.setState(args);
    },

    setState: function (args) {
      var elem = args[0];
      var stack = args[1];
      var cmd = args[2];
      if (cmd && cmd == this.props.cmd) {
        this.on = !this.on;
      } else {
        var state = this.props.state;
        this.on = js.util.grep(function (node) {
          return node.tagName == state;
        }, stack);
      }
      if (this.on) {
        js.dom.addClassName(this.elem, 'on');
      } else {
        js.dom.removeClassName(this.elem, 'on');
      }
    }

  };

});

js.extend('lsn.ext.dde', function (js) {

  this.MenuBar = js.lang.createConstructor();

  this.MenuBar.prototype = {

    construct: function (dde, props) {
      this.dde = dde;
      this.props = props;
      this.buttons = [];
      for (var i = 0, button; button = this.props['buttons'][i]; i++) {
        var btn = new js.lsn.ext.dde.MenuButton(this.dde, button);
        this.buttons.push(btn);
      }
    },

    getElements: function () {
      var elems = [];
      for (var i = 0; i < this.buttons.length; i++) {
        elems.push(this.buttons[i].getElement());
      }
      return elems;
    },

    onShow: function (args) {
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].onShow(args);
      }
    }

  };

});

js.extend('lsn.ext.dde', function (js) {

  var _defs = [#:json ./menubar.hf];

  this.MenuManager = js.lang.createConstructor();

  this.MenuManager.prototype = {

    construct: function (dde, ce) {
      this.dde = dde;
      this.active = null;
      this.mb = null;
      this.ce = ce;
      // parse button definitions into objects
      this.groups = {};
      for (var id in _defs) {
        var props = _defs[id];
        this.groups[id] = new js.lsn.ext.dde.MenuBar(dde, props);
      }
    },

    show: function (id) {
      var args = js.util.args(arguments);
      args.shift(); // id
      if (this.active != id) {
        this.mb = this.groups[id];
        if (!this.mb) throw 'no such menubar';
        js.dom.replaceChildren(this.ce, this.mb.getElements());
        this.active = id;
      }
      this.mb.onShow(args);
    },

    hide: function () {
      js.dom.removeElement(this.mb);
      this.mb = null;
    }

  };

});

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
    this.exec('useCSS', true); // which means no, don't use css
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
      js.console.log(ex);
    }
  };

  proto.focusEnd = function (elem) {
    try {
      var range = this.getRange();
      range.selectNode(elem);
      range.collapse(false);
      this.setRange(range);
    } catch (ex) {
      js.console.log(ex);
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
      js.console.log(ex);
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
      js.console.log(ex);
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

/** @namespace lsn.ext.dde */
js.extend('lsn.ext.dde', function (js) {

  /**
   * @class Editor
   */

  this.Editor = function (dde, marker) {
    this.dde = dde;
    this.marker = null;
    this.target = null;
    if (marker) this.setMarker(marker);
  };

  var Editor = this.Editor.prototype = js.lang.createMethods();

  /**
   * @function exec
   */

  Editor.exec = function (cmd) {
  };

  /**
   * @function setMarker
   */

  Editor.setMarker = function (marker) {
    this.marker = marker;
    this.target = marker.elem;
    return this.marker;
  };

  /**
   * @function recordChanges
   */

  Editor.recordChanges = function (data) {
    throw js.error.abstract();
  };

  Editor.begin = function () {
  };

  Editor.end = function () {
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;

  this.TextEditor = function (dde) {
    // TODO: IE 9 supports the CE interface and a few bugs need to be worked out
    if (js.dom.browser.isIE) throw 'Unsupported browser';
    CEditor.apply(this, arguments);
    this.focusElement = undefined;
    this.attached = false;
    this.placeholders = [];
    this.dlgs = {};
    this.cc = new dde.js.lsn.ext.dde.ContentController();
    this.scrubber = new dde.js.dom.Scrubber(this.dde.js);
    this.clipboard = new dde.js.lsn.ext.dde.Clipboard(this.cc, this);
    this.kp = new dde.js.dom.KeyPress({'trace':false});
    for (var type in this.input) {
      this.kp.setHandler(type, this.input[type], this);
    }
    this.submarkers = new js.lsn.ext.dde.MarkerList(
      dde, js.lsn.ext.dde.markers.InlineMarker
    );
    this.hrefPopup = new js.lsn.ext.dde.popups.Href(dde, this);
    this.headingPopup = new js.lsn.ext.dde.popups.Heading(dde, this);
  };

  var TextEditor = this.TextEditor.prototype = js.lang.createMethods(
    CEditor
  );

  TextEditor.setMarker = function (marker) {
    this.marker = marker;
    this.target = marker.elem;
    return this.marker;
  };

  TextEditor.resize = function () {
    this.dde.refreshMasks();
  };

  TextEditor.begin = function (cmd) {
    this.target.contentEditable = 'true';
    this.originalValue = this.target.innerHTML;
    this.originalHref = this.target.tagName == 'A'
      ? this.dde.js.dom.getAttribute(this.target, 'href')
      : undefined;
    this.focus();
    this.attach();
    this.selectFirst();
    if (cmd) this.exec(cmd);
  };

  TextEditor.end = function () {
    this.removePlaceholders();
    this.target.blur();
    this.dde.js.dom.removeAttribute(this.target, 'contentEditable');
    this.detach();
    this.unmarkImages();
    this.submarkers.clear();
    if (this.hasChanged()) {
      this.recordChanges();
    } else if (this.target.tagName == 'A') {
      var href = this.dde.js.dom.getAttribute(this.target, 'href');
      if (this.originalHref != href) {
        this.recordChanges();
      }
    }
    this.dde.status.clear();
    if (this.hrefPopup.isActive()) this.hrefPopup.hide();
    if (this.headingPopup.isActive()) this.headingPopup.hide();
//    this.vFocus.remove();
  };

  TextEditor.hasChanged = function () {
    return this.target && this.target.innerHTML != this.originalValue;
  };

  TextEditor.recordChanges = function () {
    var elem = this.target;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = js.dom.getAttribute(elem, name);
      var val = js.data.entities.decode(raw);
      var re = new RegExp('\\[' + '#', 'g');
      val = val.replace(re, '[&#35;'); // livesite formatting
      this.dde.deltas.addDelta('store', ds, val);
    }
  };

  TextEditor.attach = function () {
    this.kp.attach(this.target);
    this.cc.attach(this.target);
    this.clipboard.attach(this.target);
    this.attached = true;
    this.startMonitor();
  };

  TextEditor.detach = function () {
    this.attached = false;
    this.stopMonitor();
    this.kp.detach(this.target);
    this.cc.detach(this.target);
    this.clipboard.detach(this.target);
  };

  TextEditor.markImages = function () {
    this.submarkers.clear();
    var imgList = this.target.getElementsByTagName('img');
    for (var i = 0, img; img = imgList[i]; i++) {
      this.dde.js.dom.setAttribute(img, 'contentEditable', 'false');
      this.submarkers.add(img);
    }
  };

  TextEditor.unmarkImages = function () {
    var imgList = this.target.getElementsByTagName('img');
    for (var i = 0, img; img = imgList[i]; i++) {
      this.dde.js.dom.removeAttribute(img, 'contentEditable');
    }
  };

  TextEditor.focus = function () {
    this.dde.frame.focus();
    if (this.target) this.target.focus();
  };

  TextEditor.startMonitor = function () {
    if (this.monitorId) return;
    this.monitorId = js.dom.setInterval(this.monitorCallback, 250, this);
    this.monitorCallback();
  };

  TextEditor.stopMonitor = function () {
    js.dom.clearInterval(this.monitorId);
    this.monitorId = null;
  };

  TextEditor.monitorCallback = function () {
    if (!this.attached) return;
    try {
      var sel = this.cc.getSelection();
      var value = this.target.innerHTML;
      if (value != this.lastCheckedValue) {
        this.updateDisplay();
      }
      if (sel.anchorNode !== this.last_anchorNode ||
          sel.anchorOffset != this.last_anchorOffset ||
          sel.focusNode !== this.last_focusNode ||
          sel.focusOffset != this.last_focusOffset) {
        this.updateUI();
      }
      this.lastCheckedValue = value;
      this.last_anchorNode = sel.anchorNode;
      this.last_anchorOffset = sel.anchorOffset;
      this.last_focusNode = sel.focusNode;
      this.last_focusOffset = sel.focusOffset;
    } catch (ex) {
    }
  };

  TextEditor.updateDisplay = function () {
    this.dde.refreshMasks();
    this.markImages();
  };

  TextEditor.updateUI = function (cmd) {
    this.focusElement = this.cc.getFocusElement() || this.target;
    var stack = this.cc.getElementStack(this.focusElement);
    var menuId = this.getTargetMenuId();
    var menuElem = this.focusElement;
    var spath = [];
    var isAnchor = false;
    var isHeading = false;
    for (var i = 0, elem; elem = stack[i]; i++) {

      spath.unshift(elem.tagName);

      if (elem.tagName == 'A') {
        if (elem === this.target && !js.util.grep('href', this.marker.attrs.keys())) {
          menuId = 'empty';
          menuElem = null;
          isAnchor = true;
        } else {
          if (this.hrefPopup.isActive()) {
            if (this.hrefPopup.target != elem) this.hrefPopup.show(elem);
            isAnchor = true;
          } else {
            var imgs = elem.getElementsByTagName('img');
            if (imgs.length == 0) {
              this.hrefPopup.show(elem);
              isAnchor = true;
              menuElem = elem;
            }
          }
        }
      }

      if (/^H[123456]/.test(elem.tagName) && elem !== this.target) {
        isHeading = true;
        if (!this.headingPopup.isActive() || this.headingPopup.target != elem) {
          this.headingPopup.show(elem);
        }
      }

    }
    if (!isHeading && this.headingPopup.isActive()) this.headingPopup.hide();
    if (!isAnchor && this.hrefPopup.isActive()) this.hrefPopup.hide();
    var pathMenu = [];
    var lastIdx = spath.length - 1;
    for (var i = 0, tagName; tagName = spath[i]; i++) {
      var elem = js.dom.createElement('span=' + tagName);
      if (i > 0) {
        elem.appendChild(js.dom.createElement('a', {
          'onClick': [this.onSplice, this, [lastIdx - i]],
          'title': 'Unwrap this node (remove it but not its children)',
          'href': '#',
          'style': {'color':'red', 'text-decoration':'none'}
        }, ['sub=(x)']));
      }
      pathMenu.push(elem);
      if (spath[i + 1]) pathMenu.push(js.dom.createElement('TT= &raquo; '));
    }
    this.dde.status.setChildren(pathMenu);
    this.dde.mm.show(menuId, menuElem, stack, cmd);
  };

  TextEditor.getTargetMenuId = function () {
    var menuId = 'empty';
    switch (this.target.tagName) {
      case 'DIV':
        menuId = 'text-block';
        break;
      default:
        menuId = 'text-inline';
    }
    return menuId;
  };

  TextEditor.exec = function (cmd) {
    var spec = cmd.split(':');
    var name = spec.shift();
    if (this[name] instanceof Function) {
      this[name].apply(this, spec);
    } else if (name == 'removeLink') {
      var anchors = this.cc.getElementsByTagName('A');
      for (var i = 0, a; a = anchors[i]; i++) {
        this.dde.js.dom.removeElementOrphanChildren(a);
      }
      this.cc.exec('unlink');
    } else if (name == 'editHTML') {
        var dlg = env.dialogs.get('ext-editors-live-edit-html');
        dlg.show({
          'js': this.dde.js,
          'target': this.target,
          'editor': this
        });
    } else if (name == 'replaceText') {
      this.showDialog('[#`./dlg-edit-find-replace.html`]');
    } else if (name == 'scrubHTML') {
      var cursorStack = this.cc.getCursorStack();
      this.scrubber.scrub(this.target);
      if (this.marker.getOption('paras') == 'enforce') {
        this.forceParagraphs();
      }
      this.cc.setCursor(cursorStack);
    } else if (name.match(/^justify/)) {
      this.setParagraphJustification(name);
    } else if (name == 'cancelEditing') {
      function confirmCancel (bAnswer) {
        if (bAnswer) {
          this.target.innerHTML = this.originalValue;
          this.dde.exec('stopEditing');
        } else {
          this.focus();
        }
      }
      if (this.hasChanged()) {
        var message = 'Are you sure you want to discard changes?';
        env.status.confirm(message, [confirmCancel, this]);
      } else {
        confirmCancel.call(this, true);
      }
      return;
    } else {
      this.cc.exec(name);
    }
    this.updateUI(name);
  };

  TextEditor.showDialog = function (url) {
    if (!this.dlgs[url]) {
      this.dlgs[url] = new js.lsn.Dialog(url, {'refetch':false});
    }
    this.dlgs[url].show({
      'js': this.dde.js,
      'target': this.target,
      'editor': this
    });
  };

  TextEditor.onSplice = function (event, idx) {
    js.dom.stopEvent(event);
    var stack = this.cc.getElementStack(this.focusElement);
    var elem = stack[idx];
    js.console.log('splice', idx, elem);
    this.dde.js.dom.removeElementOrphanChildren(elem);
    this.updateUI();
    this.focus();
  };

  TextEditor.setAttribute = function (name, value) {
    if (!this.focusElement) return;
    this.dde.js.dom.setAttribute(this.focusElement, name, value);
  };

  TextEditor.selectFirst = function () {
    this.target.focus();
    if (this.target.hasChildNodes()) {
      var fc = this.target.firstChild;
      if (fc && js.dom.node.isElement(fc) && fc.tagName == 'BR' && js.dom.hasClassName(fc, 'stub')) {
        // Placeholder inserted by web server
        this.placeholders.push(fc);
      } else {
        // Select first text node
        var textNode = js.dom.findNode(this.target, function (n) {
          return js.dom.node.isText(n);
        });
        if (textNode) this.cc.focusStart(textNode);
      }
    } else {
      // Should only reach this when manually clearing html
      this.insertPlaceholder();
    }
    this.updateUI();
  };

  TextEditor.jumpForward = function () {
    if (this.hrefPopup && this.hrefPopup.isActive()) {
      this.hrefPopup.focus();
//  } else if (this.headingPopup && this.headingPopup.isActive()) {
//    this.headingPopup.focus();
    } else {
      this.dde.selectNext();
    }
  };

  TextEditor.jumpBackward = function () {
    this.dde.selectPrevious();
  };

  /**
   * @function forceParagraphs
   *
   * This policy states that only P elements are allowed to be children
   * of the elment.  This method iterates the element and wraps any elements 
   * which are not paragraphs in a newly constructed one.
   */

  TextEditor.forceParagraphs = function () {
    js.console.log('Enforcing paragraphs');
    var node = this.target.firstChild;
    var orphans = [];
    function adoptOrphans (orphans) {
      if (!orphans.length) return;
      // Paste from MS Office pattern. Paragraphs come in as DIVs, and are
      // separated by a single DIV with a single BR child.
      for (var i = 0, elem; elem = orphans[i]; i++) {
        if (elem.tagName === 'DIV') {
          if (elem.hasChildNodes() && elem.firstChild === elem.lastChild
              && elem.firstChild.tagName === 'BR') {
            js.dom.removeElement(elem);
          } else {
            var para = js.dom.createElement('P', elem.childNodes);
            js.dom.replaceElement(para, elem);
          }
        } else {
          var para = js.dom.createElement('P');
          js.dom.insertBefore(para, elem);
          js.dom.appendChildren([elem], para);
        }
      }
    }
    while (node) {
      if (!js.dom.node.isElement(node) || node.tagName != 'P') {
        orphans.push(node);
      } else {
        adoptOrphans(orphans);
        orphans = [];
      }
      node = node.nextSibling;
    }
    adoptOrphans(orphans);
  };

  TextEditor.insert = function (spec) {
    /**
     * TODO parse spec format, such as:
     *
     *  table[tr[td,td]]
     *  div#myid[p@myclass(my text)]
     *  div{onclick:function...}
     */
    var elem;
    var br = this.dde.js.dom.createElement('br');
    switch (spec) {
      case 'ol(li(br))':
        elem = this.dde.js.dom.createElement('ol', {}, ['li', [br]]);
        break;
      case 'ul(li(br))':
        elem = this.dde.js.dom.createElement('ul', {}, ['li', [br]]);
        break;
    }
    if (elem) {
      this.cc.insertElement(elem);
      this.cc.focusStart(br);
      this.dde.refreshMasks();
    }
  };

  TextEditor.insertPlaceholder = function (parentElem) {
    if (!parentElem) parentElem = this.target;
    var ph = this.dde.js.dom.createElement('br');
    this.placeholders.push(ph);
    parentElem.appendChild(ph);
    this.cc.focusBefore(ph);
  };

  TextEditor.removePlaceholders = function () {
    // Remove UI placeholders we've inserted
    while (this.placeholders.length > 0) {
      var ph = this.placeholders.pop();
      this.dde.js.dom.removeElement(ph);
    }
  };

  TextEditor.insertBreak = function (event) {
    var eSel = this.cc.getFocusElement();
    this.dde.js.dom.stopEvent(event);
    var elem = this.dde.js.dom.createElement('br');
    if (eSel && eSel !== this.target
        && this.hrefPopup.isActive()
        && eSel.tagName && eSel.tagName == 'A'
        && !eSel.nextSibling) {
      this.dde.js.dom.insertAfter(elem, eSel);
      this.cc.focusStart(elem);
      this.hrefPopup.updateUI();
    } else {
      this.cc.insertElement(elem);
    }
  };

  TextEditor.insertParaBreak = function (event) {
    var eSel = this.cc.getFocusElement();
    this.dde.js.dom.stopEvent(event);
    var elem = this.dde.js.dom.createElement('br', {
      'style':{'clear':'both'}
    });
    this.cc.insertElement(elem);
  };

  TextEditor.insertImage = function () {
    var elem = this.dde.js.dom.createElement('img', {
      'contentEditable':'false',
      'src':'',
      'alt':'New image'
    });
    this.cc.insertElement(elem);
  };

  TextEditor.insertImageLink = function () {
    var elem = this.dde.js.dom.createElement('a', {
      'href':''
    }, ['img', {
      'contentEditable':'false',
      'src':'',
      'alt':'New image'
    }]);
    this.cc.insertElement(elem);
  };

  TextEditor.createLink = function () {
    var selText = this.cc.getSelection().toString();
    if (selText) {
      if (selText.match(/^[a-z]+:\/\//)) {
        return this.cc.exec('createLink', selText);
      } else if (selText.match(/@[\w\.-]+\.[a-z]{2,6}$/i)) {
        return this.cc.exec('createLink', 'mailto:' + selText);
      }
    }
    this.cc.exec('createLink', 'http://');
    this.updateUI();
    this.hrefPopup.focus();
  };

  TextEditor.foreColor = function () {
    var color = prompt('Color (e.g., #0479A7)');
    if (color) {
      this.cc.exec('foreColor', color);
      var stack = this.cc.getElementStack(this.focusElement);
      for (var i = 0, elem; elem = stack[i]; i++) {
        if (elem.tagName == 'A') {
          this.dde.js.dom.setStyle(elem, 'color', color);
        }
      }
    }
  };

  TextEditor.setParagraphType = function (tagName) {
    var elem = this.cc.getContainingParagraph();
    var newElem = this.dde.js.dom.createElement(tagName);
    if (elem && elem === this.target) {
      this.dde.js.dom.insertElementAdoptChildren(newElem, elem);
    } else if (elem) {
      this.dde.js.dom.appendChildren(newElem, elem.childNodes);
      this.dde.js.dom.replaceElement(newElem, elem);
    } else {
      this.cc.insertElement(newElem);
    }
    if (!newElem.firstChild) {
      this.insertPlaceholder(newElem);
    } else {
      this.cc.focusStart(newElem.firstChild);
    }
  };

  TextEditor.setParagraphJustification = function (cmd) {
    var elem = this.cc.getContainingParagraph();
    if (elem && elem !== this.target) {
      var align = cmd == 'justifyRight' ? 'right' :
                  cmd == 'justifyFull' ? 'justify' :
                  cmd == 'justifyCenter' ? 'center' : 'left';
      if (align == 'justify') {
        this.dde.js.dom.setStyle(elem, 'text-align', align);
      } else {
        this.dde.js.dom.setAttribute(elem, 'align', align);
      }
    } else {
      alert('Cannot set justification: No containing paragraph');
    }
  };

  TextEditor.setHTML = function (htmlText) {
    var src = htmlText.replace(/^\s+|\s+$/g, '');
    this.dde.js.dom.setAttribute(this.target, 'innerHTML', src);
    this.selectFirst();
  };

  TextEditor.getHTML = function () {
    this.removePlaceholders();
    return this.dde.js.dom.getAttribute(this.target, 'innerHTML');
  };

  TextEditor.input = {

    'ctrl+shift+v': function (event) {
      js.console.log('TODO', 'Paste unformatted text');
      this.clipboard.setNextMode(1);
    },

    'ctrl+a': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.cc.selectContents();
    },

    'shift+enter': function (event) {
      this.insertBreak(event);
    },

    'ctrl+shift+enter': function (event) {
      this.insertParaBreak(event);
    },

    'enter': function (event) {
      // If the focus is on the target then insert a BR break. This prevents
      // content-editable P elements from duplicating and the like.
      if (this.focusElement === this.target ||
          this.cc.getRange().endContainer === this.target) {
        return this.insertBreak(event);
      }
      // When the target is a child of a LI, DT, or DD we want to prevent the
      // default action (which creates a new list-item for instance).  We do
      // want to let the default action happen if that LI, DT, or DD happens
      // to be a child of this target.
      var inside = true;
      var node = this.focusElement;
      while (node) {
        if (node === this.target) {
          inside = false;
        }
        if (!js.dom.node.isElement(node)) break;
        if (node.tagName.match(/^(LI|DT|DD)$/)) {
          return inside ? null : this.insertBreak(event);
        }
        node = node.parentNode;
      }
    },

    'tab': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.jumpForward();
    },

    'shift+tab': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.jumpBackward();
    },

    'ctrl+b': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.exec('bold');
    },

    'ctrl+i': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.exec('italic');
    },

    'ctrl+u': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.exec('underline');
    },

    'ctrl+l': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.createLink();
    },

    'ctrl+0': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.setParagraphType('p');
    },

    'ctrl+1': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.setParagraphType('h1');
    },

    'ctrl+2': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.setParagraphType('h2');
    },

    'ctrl+3': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.setParagraphType('h3');
    },

    'ctrl+4': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.setParagraphType('h4');
    },

    'ctrl+g': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.insertImage();
    },

    'ctrl+shift+g': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.insertImageLink();
    },

    'ctrl+e': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.exec('editHTML');
    },

    'ctrl+m': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.exec('scrubHTML');
    },

    'esc': function (event) {
      this.dde.js.dom.stopEvent(event);
      this.dde.deselect();
    }

  };

});

js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var BlockEditor = js.lang.createMethods(CEditor);

  this.BlockEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
  };

  this.BlockEditor.prototype = BlockEditor;

  BlockEditor.resize = function () {
    this.dde.refreshMasks();
  };

  BlockEditor.begin = function () {
    this.dde.refreshMasks();
    this.dde.mm.show('block');
  };

  BlockEditor.end = function () {
  };

  BlockEditor.focus = function () {
  };

  BlockEditor.exec = function (cmd, args) {
    var func = this[cmd];
    if (!js.util.isa(func, Function)) throw 'No such command: ' + cmd;
    func.apply(this, args);
  };

  BlockEditor.moveUp = function () {
    var cluster = this.marker.cluster;
    var prev = cluster.previousSibling;
    if (!prev) return;
    var refElem = prev.firstChild.data;
    var node = cluster.firstChild;
    while (node) {
      refElem.parentNode.insertBefore(node.data, refElem);
      node = node.nextSibling;
    }
    cluster.parentNode.insertBefore(cluster, prev);
    this.dde.refreshMasks();
    this.dde.scrollToMarker();
    this.recordChanges();
  };

  BlockEditor.moveDown = function () {
    var cluster = this.marker.cluster;
    var next = cluster.nextSibling;
    if (!next) return;
    var refElem = next.lastChild.data;
    var node = cluster.lastChild;
    while (node) {
      this.dde.js.dom.insertAfter(node.data, refElem);
      node = node.previousSibling;
    }
    cluster.parentNode.insertAfter(cluster, next);
    this.dde.refreshMasks();
    this.dde.scrollToMarker();
    this.recordChanges();
  };

  BlockEditor.recordChanges = function (group) {
    if (!group) group = this.marker.cluster.parentNode;
    var ds = group.data.begin.attrs.ds;
    var indexes = [];
    var node = group.firstChild;
    while (node) {
      indexes.push(node.data.attrs.key);
      node = node.nextSibling;
    }
    this.dde.deltas.addDelta('reorder', ds, indexes);
  };

  BlockEditor.insertBefore = function () {
    this.insert(true);
  };

  BlockEditor.insertAfter = function () {
    this.insert(false);
  };

  BlockEditor.insert = function (bBefore) {

    var ok = this.dde.deltas.isUpToDate()
      ? true
      : confirm('This will require saving your current changes, continue?');
    if (!ok) return;

    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var attrs = group.data.begin.attrs;
    var ds = group.data.begin.attrs.ds;
    var index = null;
    var dnode = env.hub.get(ds, [function (dnode) {

      if (!dnode) return;

      if (dnode.isDataArray()) {
        if (dnode.length) {
          index = js.util.asInt(cluster.index);
          if (!bBefore) index++;
        } else {
          index = 0;
        }
      } else if (dnode.isDataHash()) {
        var uuid = js.util.createUUID();
        index = uuid.split('-')[0];
      }

      if (attrs['new']) {

        this.createBlock(dnode, index, attrs['new']);

      } else if (attrs['of']) {

        // This block one 'of' a variety. It gets initialized from a skeleton.

        function onSubmit (action, values, dnode, index) {
          var srcAddr = values.skeleton;
          this.createBlock(dnode, index, srcAddr);
        }

        env.dialogs.get('ext-editors-live-select-skeleton').run(
          {'addr': attrs['of']},
          [onSubmit, this, [dnode, index]]
        );

      } else if (attrs['from']) {

        // See this marker's getEditor function
        js.lang.assert(false, 'Marker should have used BlockListEditor');

      } else {

        alert('We cannot determine how a new item should be created');

      }

    }, this]);

  };

  BlockEditor.createBlock = function (dnode, index, srcAddress) {
    var ds = dnode.getAddress();
    if (dnode.isDataHash()) {
      var destAddr = ds + '/' + index;
      this.dde.deltas.addDelta('copy', srcAddress, destAddr);
    } else {
      this.dde.deltas.addDelta('insert', ds, index, srcAddress);
    }
    this.dde.deselect();
    this.dde.exec('docSave', true);
  };

  BlockEditor.remove = function () {
    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var key = cluster.data.attrs.key;
    cluster.data.attrs.key = undefined;
    var addr = group.data.begin.attrs.ds;
    if ((!addr) || (!key && key !== 0)) {
      throw 'Cannot determine data address';
    }
    if (!confirm('Remove the select block?')) return;
    addr += '/' + key;
    this.dde.deltas.addDelta('remove', addr);
    this.dde.deselect();
    var node = cluster.firstChild;
    while (node) {
      this.dde.removeMarkersFrom(node.data);
      node.data.parentNode.removeChild(node.data);
      node.data = null;
      node = node.nextSibling;
    }
    group.removeChild(cluster);
    this.recordChanges(group); // need to update any reording that happened before the delete
    this.dde.removeMarker(this.marker);
    this.dde.refreshMarkers();
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var _proto = js.lang.createMethods(CEditor);

  this.BlockListEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.dlg = null;
  };

  this.BlockListEditor.prototype = _proto;

  _proto.resize = function () {
    this.dde.refreshMasks();
  };

  _proto.begin = function () {
    this.dde.refreshMasks();
    this.dde.mm.show('none');
    this.show();
  };

  _proto.getDialog = function () {
    if (!this.dlg) {
      this.dlg = env.dialogs.get('ext-editors-live-select-key');
      this.dlg.addActionListener('onDialogHide', function (action) {
        this.dde.deselect();
      }, this);
    }
    return this.dlg;
  };

  _proto.show = function () {

    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var attrs = group.data.begin.attrs;
    var ds = group.data.begin.attrs.ds;

    var context = {
      'addr': attrs['from'],
      'ds': ds
    };

    function onSubmit (action, values, context) {

      var ok = this.dde.deltas.isUpToDate()
        ? true
        : confirm('This will require saving your current changes, continue?');

      if (!ok) return;

      var indexes = [];
      var list = context.assignedItems;
      for (var opt = list.firstChild; opt; opt = opt.nextSibling) {
        indexes.push(opt.value);
      }

      this.dde.deltas.addDelta('store', ds, indexes);
      this.dde.exec('docSave', true);

    }

    this.getDialog().run(context, [onSubmit, this, [context]]);

  };

});

js.extend('lsn.ext.dde', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;
  var _attrProps = [#:js:var ./attributes.hf];

  this.AttributeControl = function (attr, ds) {
    CActionDispatcher.apply(this);
    this.ui = {}; // dom elements
    this.attr = attr; // attribute name
    this.ds = ds; // datasource
    this.orig = ''; // original value
    this.input = null; // input element
    this.combo = null; // drop-down combo box
    this.vChange = null; // onChange event listener
    try {
      this.props = _attrProps.get(this.attr).toObject();
    } catch (ex) {
      this.props = {'label': attr};
      js.console.log('No control properties for attribute: ' + attr);
    }
  };

  var AttributeControl =
    this.AttributeControl.prototype =
      js.lang.createMethods(CActionDispatcher);

  AttributeControl.getRootElement = function () {
    return this.ui.root || this.createUI();
  };

  AttributeControl.createUI = function () {
    // Label
    this.ui.dt = js.dom.createElement('DT', {
      'innerHTML': this.props.label
    });
    // Input element
    this.ui.dd = js.dom.createElement('DD');
    this.input = this.createInput();
    if (!this.hidden) {
      this.ui.dd.appendChild(this.input);
      this.extendInput();
    }
    // Label/input pair
    this.ui.root = js.dom.createElement('DL', [
      this.ui.dt,
      this.ui.dd
    ]);
    return this.ui.root;
  };

  AttributeControl.createInput = function () {
    var input = null;
    if (this.props.options) {
      input = js.dom.createElement('SELECT');
      for (var j = 0, opt; opt = this.props.options[j]; j++) {
        var optElem = js.dom.createElement('OPTION', {
          'value': opt.value,
          'innerHTML': opt.text
        });
        input.appendChild(optElem);
      }
    } else if (this.hidden) {
      input = {'value': null};
    } else {
      input = js.dom.createElement('INPUT');
      this.vChange = new js.dom.EventListener(input, 'change',
        this.onChange, this);
    }
    return input;
  };

  AttributeControl.extendInput = function () {
    if (this.attr == 'src') {
      this.combo = new js.lsn.ext.dde.ImageCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    } else if (this.attr == 'href') {
      this.combo = new js.lsn.ext.dde.FileCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    }
  };

  AttributeControl.onChange = function () {
    this.dispatchAction('onChange');
  };

  AttributeControl.getHelp = function () {
    if (this.props.summary) {
      var str = '<b>' + this.props.label + '</b>';
      if (this.props.example) {
        str += ' (<span class="eg">e.g., ' + this.props.example + '</span>)';
      }
      str += '<br/>';
      str += this.props.summary;
      return str;
    } else {
      return '<i>No help available</i>';
    }
  };

  AttributeControl.setOriginalValue = function (value) {
    this.orig = value;
    this.input.value = value;
    return value;
  };

  AttributeControl.setValue = function (value) {
    js.dom.setValue(this.input, value);
    return value;
  };

  AttributeControl.getValue = function () {
    return this.hidden ? this.orig : js.dom.getValue(this.input);
  };

  AttributeControl.reset = function () {
    this.orig = '';
  };

  AttributeControl.destroy = function () {
    if (this.vChange) this.vChange.remove();
    if (this.combo) this.combo.destroy();
  };

});

js.extend('lsn.ext.dde', function (js) {

  //var _attrProps = [#:js:var ./attributes.hf];

  var CEditor = js.lsn.ext.dde.Editor;

  this.AttributeEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.modified = false;
    this.dde.mm.show('none');
    this.opts = this.initOptions();
    this.ctrls = this.initControls();
  };

  var AttributeEditor =
    this.AttributeEditor.prototype =
      js.lang.createMethods(CEditor);

  AttributeEditor.initOptions = function () {
    var optStr = this.dde.js.dom.getAttribute(this.target, '_lsn_opts');
    return js.lsn.ext.dde.parseAttributes(optStr);
  };

  AttributeEditor.initControls = function () {
    var result = [];
    // Create a control for each attribute defined by the marker
    var attrs = this.marker.getAttributes();
    attrs.iterate(function (attr, ds) {
      result.push(new js.lsn.ext.dde.AttributeControl(attr, ds));
    }, this);
    return result;
  };

  AttributeEditor.getControl = function (attr) {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      if (ctrl.attr === attr) return ctrl;
    }
  };

  AttributeEditor.resize = function () {
    this.dde.refreshMasks();
  };

  AttributeEditor.begin = function () {
    this.dde.refreshMasks();
    if (!this.dlg) {
      this.dlg = new js.lsn.Dialog("[#:html:url './dlg-edit-attr.html']", {
        modal:true, modalOpacity:0, refetch:false
      });
      this.dlg.addEvent('show', js.lang.Callback(this.onShow, this));
      this.dlg.addEvent('ready', js.lang.Callback(this.onReady, this));
      this.dlg.addEvent('ok', js.lang.Callback(this.onOk, this));
      this.dlg.addEvent('apply', js.lang.Callback(this.onApply, this));
      this.dlg.addEvent('cancel', js.lang.Callback(this.onCancel, this));
    }
    this.dlg.show();
  };

  AttributeEditor.end = function () {
    this.dlg.hide();
    if (this.modified) {
      this.recordChanges();
    }
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.destroy();
    }
  };

  AttributeEditor.recordChanges = function (data) {
    var elem = this.elem;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = this.getAttributeValue(name);
//    var raw = data[name];
      if (!js.util.defined(raw)) raw = '';
      var val = js.data.entities.decode(raw);
      var re = new RegExp('\\[' + '#', 'g');
      val = val.replace(re, '[&#35;'); // livesite formatting
      this.dde.deltas.addDelta('store', ds, val);
    }
  };

  AttributeEditor.canRemove = function () {
    return false;
  };

  AttributeEditor.focus = function () {
    var ctrl = this.ctrls[0];
    if (ctrl) {
      ctrl.input.focus();
    }
  };

  AttributeEditor.getValue = function (attr) {
    var ctrl = this.getControl(attr);
    return ctrl ? ctrl.getValue() : undefined;
  };

  AttributeEditor.onShow = function () {
    js.dom.removeChildren(this.dlg.params.container);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var elem = ctrl.getRootElement();
      ctrl.setOriginalValue(this.getAttribute(ctrl.attr));
      if (!ctrl.hidden) {
        js.dom.addEventListener(
          ctrl.input, 'focus', this.showHelp, this, [ctrl]
        );
        js.dom.appendChild(this.dlg.params.container, elem);
      }
    }
    if (this.canRemove()) {
      var btnApply = this.dlg.getElementById('btn_apply');
      js.dom.insertBefore(js.dom.createElement(
        'button=Delete', {
          'onClick': [this.onRemove, this],
          'id': 'btn_remove'
        }
      ), btnApply);
    }
  };

  AttributeEditor.showHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, ctrl.getHelp());
  };

  AttributeEditor.clearHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, '');
  };

  AttributeEditor.onReady = function () {
    if (!this.helpArea) {
      this.helpArea = js.dom.createElement('div', {'class':'help'});
      var pe = this.dlg.getElementById('btnbar');
      js.dom.insertAfter(this.helpArea, pe);
    }
    this.focus();
  };

  AttributeEditor.onApply = function () {
    var isResized = false;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var attr = ctrl.attr;
      var value = ctrl.getValue();
      this.setAttribute(attr, value);
    }
    this.dde.refreshMasks();
  };

  AttributeEditor.setAttribute = function (attr, value) {
    if (this.target.tagName == 'A') {
      // When updating anchors where the text is the same as the link, we
      // will update the text when the link changes.
      if (attr == 'href') {
        var href = this.dde.js.dom.getAttribute(this.target, 'href');
        if (this.target.innerHTML == href) {
          this.target.innerHTML = value;
        }
      }
    }
    this.dde.js.dom.setAttribute(this.target, attr, value);
  };

  AttributeEditor.getAttribute = function (attr) {
    return this.dde.js.dom.getAttribute(this.target, attr);
  };

  /** getAttributeValue - Get the final storage value
   *
   *  This abstraction is originally provided for the image src attribute. It
   *  allows one to have one final data value that is handled by multiple
   *  input controls. The multiple input controls use [get/set]Attribute, and
   *  only when changes are recorded does getAttributeValue get called.
   */
  AttributeEditor.getAttributeValue = AttributeEditor.getAttribute;

  AttributeEditor.onOk = function () {
    this.onApply();
    this.modified = true;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.reset();
    }
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

  AttributeEditor.onCancel = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setAttribute(ctrl.attr, ctrl.orig);
    }
    this.modified = false;
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

});

/** @namespace lsn.ext.dde */
js.extend('lsn.ext.dde', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;
  var _attrProps = [#:js:var ./styles.hf];

  /**
   * @class StyleControl
   */

  this.StyleControl = function (attr, ds) {
    CActionDispatcher.apply(this);
    this.ui = {}; // dom elements
    this.attr = attr; // attribute name
    this.ds = ds; // datasource
    this.orig = ''; // original value
    this.input = null; // input element
    this.combo = null; // drop-down combo box
    this.vChange = null; // onChange event listener
    try {
      this.props = _attrProps.get(this.attr).toObject();
    } catch (ex) {
      this.props = {'label': attr};
      js.console.log('No control properties for attribute: ' + attr);
    }
  };

  var StyleControl =
    this.StyleControl.prototype =
      js.lang.createMethods(CActionDispatcher);

  /**
   * @function getRootElement
   */

  StyleControl.getRootElement = function () {
    return this.ui.root || this.createUI();
  };

  /**
   * @function createUI
   */

  StyleControl.createUI = function () {
    // Label
    this.ui.dt = js.dom.createElement('DT', {
      'innerHTML': this.props.label
    });
    // Input element
    this.ui.dd = js.dom.createElement('DD');
    this.input = this.createInput();
    if (!this.hidden) {
      this.ui.dd.appendChild(this.input);
      this.extendInput();
    }
    // Label/input pair
    this.ui.root = js.dom.createElement('DL', [
      this.ui.dt,
      this.ui.dd
    ]);
    return this.ui.root;
  };

  /**
   * @function createInput
   */

  StyleControl.createInput = function () {
    var input = null;
    if (this.props.options) {
      input = js.dom.createElement('SELECT');
      for (var j = 0, opt; opt = this.props.options[j]; j++) {
        var optElem = js.dom.createElement('OPTION', {
          'value': opt.value,
          'innerHTML': opt.text
        });
        input.appendChild(optElem);
      }
    } else if (this.hidden) {
      input = {'value': null};
    } else {
      input = js.dom.createElement('INPUT');
      this.vChange = new js.dom.EventListener(input, 'change',
        this.onChange, this);
    }
    return input;
  };

  /**
   * @function extendInput
   */

  StyleControl.extendInput = function () {
    if (this.attr == 'background-image') {
      this.combo = new js.lsn.ext.dde.ImageCombo();
      this.combo.addActionListener('select', this.onChange, this);
      this.combo.attach(this.input);
      this.combo.expand('/');
    }
  };

  /**
   * @function onChange
   */

  StyleControl.onChange = function () {
    this.dispatchAction('onChange');
  };

  /**
   * @function getHelp
   */

  StyleControl.getHelp = function () {
    if (this.props.summary) {
      var str = '<b>' + this.props.label + '</b>';
      if (this.props.example) {
        str += ' (<span class="eg">e.g., ' + this.props.example + '</span>)';
      }
      str += '<br/>';
      str += this.props.summary;
      return str;
    } else {
      return '<i>No help available</i>';
    }
  };

  /**
   * @function unmarshallValue
   *    url(...) --> ...
   *    10px     --> 10
   */

  StyleControl.unmarshallValue = function (value) {
    var valueString = new String(value);
    var prefix = this.props.prefix;
    var suffix = this.props.suffix;
    if (prefix && valueString.indexOf(prefix) == 0) {
      valueString = valueString.substr(prefix.length);
    }
    if (suffix) {
      var i = valueString.lastIndexOf(suffix);
      if (i == (valueString.length - suffix.length)) {
        valueString = valueString.substring(0, i);
      }
    }
    if (valueString.match(/^[a-z]+:\/\//)) {
      var url = new js.http.Location(valueString);
      if (url.isSameOrigin()) {
        valueString = url.getAddress();
      }
    }
    valueString = valueString.replace(/^"/, '');
    valueString = valueString.replace(/"$/, '');
    return valueString;
  };

  /**
   * @function marshallValue
   *    url(...) <-- ...
   *    10px     <-- 10
   */

  StyleControl.marshallValue = function (value) {
    var valueString = new String(value);
    var prefix = this.props.prefix || '';
    var suffix = this.props.suffix || '';
    valueString = valueString.replace(/^"/, '');
    valueString = valueString.replace(/"$/, '');
    return prefix + valueString + suffix;
  };

  /**
   * @function setOriginalValue
   */

  StyleControl.setOriginalValue = function (value) {
    value = this.unmarshallValue(value);
    this.orig = value;
    this.input.value = value;
    return value;
  };

  /**
   * @function setValue
   */

  StyleControl.setValue = function (value) {
    value = this.unmarshallValue(value);
    js.dom.setValue(this.input, value);
    return value;
  };

  /**
   * @function getValue
   */

  StyleControl.getValue = function () {
    return this.hidden ? this.orig : this.marshallValue(js.dom.getValue(this.input));
  };

  /**
   * @function reset
   */

  StyleControl.reset = function () {
    this.orig = '';
  };

  /**
   * @function destroy
   */

  StyleControl.destroy = function () {
    if (this.vChange) this.vChange.remove();
    if (this.combo) this.combo.destroy();
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;

  this.StyleEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.modified = false;
    this.dde.mm.show('none');
    this.opts = this.initOptions();
    this.ctrls = this.initControls();
  };

  var StyleEditor =
    this.StyleEditor.prototype =
      js.lang.createMethods(CEditor);

  StyleEditor.initOptions = function () {
    var optStr = this.dde.js.dom.getAttribute(this.target, '_lsn_opts');
    return js.lsn.ext.dde.parseAttributes(optStr);
  };

  StyleEditor.initControls = function () {
    var result = [];
    // Create a control for each attribute defined by the marker
    var attrs = this.marker.getAttributes();
    attrs.iterate(function (attr, ds) {
      result.push(new js.lsn.ext.dde.StyleControl(attr, ds));
    }, this);
    return result;
  };

  StyleEditor.getControl = function (attr) {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      if (ctrl.attr === attr) return ctrl;
    }
  };

  StyleEditor.resize = function () {
    this.dde.refreshMasks();
  };

  StyleEditor.begin = function () {
    this.dde.refreshMasks();
    if (!this.dlg) {
      this.dlg = new js.lsn.Dialog("[#:html:url './dlg-edit-style.html']", {
        modal:true, modalOpacity:0, refetch:false
      });
      this.dlg.addEvent('show', js.lang.Callback(this.onShow, this));
      this.dlg.addEvent('ready', js.lang.Callback(this.onReady, this));
      this.dlg.addEvent('ok', js.lang.Callback(this.onOk, this));
      this.dlg.addEvent('apply', js.lang.Callback(this.onApply, this));
      this.dlg.addEvent('cancel', js.lang.Callback(this.onCancel, this));
    }
    this.dlg.show();
  };

  StyleEditor.end = function () {
    this.dlg.hide();
    if (this.modified) {
      var data = {};
      for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
        data[ctrl.attr] = ctrl.getValue();
      }
      this.recordChanges(data);
    }
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.destroy();
    }
  };

  StyleEditor.recordChanges = function (data) {
    var elem = this.elem;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = data[name];
      var val = js.data.entities.decode(raw);
      var re = new RegExp('\\[' + '#', 'g');
      val = val.replace(re, '[&#35;'); // livesite formatting
      this.dde.deltas.addDelta('store', ds, val);
    }
  };

  StyleEditor.canRemove = function () {
    return false;
  };

  StyleEditor.focus = function () {
    var ctrl = this.ctrls[0];
    if (ctrl) {
      ctrl.input.focus();
    }
  };

  StyleEditor.getValue = function (attr) {
    var ctrl = this.getControl(attr);
    return ctrl ? ctrl.getValue() : undefined;
  };

  StyleEditor.onShow = function () {
    js.dom.removeChildren(this.dlg.params.container);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var elem = ctrl.getRootElement();
      ctrl.setOriginalValue(this.getStyle(ctrl.attr));
      if (!ctrl.hidden) {
        js.dom.addEventListener(
          ctrl.input, 'focus', this.showHelp, this, [ctrl]
        );
        js.dom.appendChild(this.dlg.params.container, elem);
      }
    }
    if (this.canRemove()) {
      var btnApply = this.dlg.getElementById('btn_apply');
      js.dom.insertBefore(js.dom.createElement(
        'button=Delete', {
          'onClick': [this.onRemove, this],
          'id': 'btn_remove'
        }
      ), btnApply);
    }
  };

  StyleEditor.showHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, ctrl.getHelp());
  };

  StyleEditor.clearHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, '');
  };

  StyleEditor.onReady = function () {
    if (!this.helpArea) {
      this.helpArea = js.dom.createElement('div', {'class':'help'});
      var pe = this.dlg.getElementById('btnbar');
      js.dom.insertAfter(this.helpArea, pe);
    }
    this.focus();
  };

  StyleEditor.onApply = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setStyle(ctrl.attr, ctrl.getValue());
    }
    this.dde.refreshMasks();
  };

  StyleEditor.getStyle = function (name) {
    var ccn = js.util.asCamelCaseName(name);
    return this.target.style[ccn];
  };

  StyleEditor.setStyle = function (name, value) {
    var ccn = js.util.asCamelCaseName(name);
    return this.target.style[ccn] = value;
  };

  StyleEditor.onOk = function () {
    this.onApply();
    this.modified = true;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.reset();
    }
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

  StyleEditor.onCancel = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setStyle(ctrl.attr, ctrl.orig);
    }
    this.modified = false;
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

});

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

js.extend('lsn.ext.dde', function (js) {

  var Package = this;
  var CImage = js.lsn.ext.dde.ImageCtrl;

  Package.BackgroundImageCtrl = function (dde, target) {
    CImage.apply(this, arguments);
  };

  var Proto = Package.BackgroundImageCtrl.prototype = js.lang.createMethods(
    CImage
  );

  // Wrap the URI in CSS url syntax
  function srcToCssUrl (src) {
    return 'url(' + src + ')';
  }

  // Unwrap the URI from CSS url syntax
  function cssUrlToSrc (cssUrl) {
    var parts = cssUrl.match(/^url\(['"]?([^'")]+)['"]?\)/);
    return parts ? parts[1] : cssUrl;
  }

  function unwrapNumbers (cssValue) {
    var result = [];
    var parts = cssValue.split(/\s/);
    for (var i = 0; i < parts.length; i++) {
      result.push(parseInt(parts[i], 10));
    }
    return result;
  }

  Proto.readTarget = function () {
    var bgImage = this.dde.js.dom.getStyle(this.target, 'background-image');
    var bgSize = this.dde.js.dom.getStyle(this.target, 'background-size');
    var bgPos = this.dde.js.dom.getStyle(this.target, 'background-position');
    bgImage = cssUrlToSrc(bgImage);
    bgSize = unwrapNumbers(bgSize);
    bgPos = unwrapNumbers(bgPos);
    this.orig.src = new this.dde.js.http.Location(bgImage);
    this.orig.w = bgSize[0];
    this.orig.h = bgSize[1];
    this.orig.x = bgPos[0];
    this.orig.y = bgPos[1];
  };

  Proto.updateTarget = function () {
    this.dde.js.dom.setStyle(this.target, 'background-image',
      srcToCssUrl(this.current.src.getHref()));
    this.dde.js.dom.setStyle(this.target, 'background-size',
      this.current.w + 'px ' + this.current.h + 'px');
    this.dde.js.dom.setStyle(this.target, 'background-position',
      this.current.x + 'px ' + this.current.y + 'px');
    this.dde.refreshMasks();
  };

});

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

js.extend('lsn.ext.dde', function (js) {

  var CImageEditor = js.lsn.ext.dde.ImageEditor;

  this.InlineImageEditor = function () {
    CImageEditor.apply(this, arguments);
  };

  var InlineImageEditor =
  this.InlineImageEditor.prototype = js.lang.createMethods(
    CImageEditor
  );

  /**
   * @function canRemove
   *
   * Inline elements may be removed.
   */

  InlineImageEditor.canRemove = function () {
    return true;
  };

  /**
   * @function recordChanges
   *
   * Inline elements do not store directly, as they're simply content of
   * a greater, storable element.
   */

  InlineImageEditor.recordChanges = function (data) {
  };

  /**
   * @function onRemove
   *
   * Called when the user clicks the Delete button.
   */

  InlineImageEditor.onRemove = function (event) {
    if (confirm('Are you sure?')) {
      this.onCancel();
      this.end();
      this.dde.js.dom.removeElement(this.target);
    }
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var _proto = js.lang.createMethods(CEditor);

  this.InputEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.dlg = null;
  };

  this.InputEditor.prototype = _proto;

  _proto.resize = function () {
    this.dde.refreshMasks();
  };

  _proto.begin = function () {
    this.dde.refreshMasks();
    this.dde.mm.show('none');
    this.show();
  };

  _proto.getDialog = function () {
    if (!this.dlg) {
      this.dlg = env.dialogs.get('ext-editors-live-input');
      this.dlg.addActionListener('onDialogHide', function (action) {
        this.dde.deselect();
      }, this);
    }
    return this.dlg;
  };

  _proto.show = function () {
    var context = {
      'marker': this.marker
    };
    function onSubmit (action, formValues, context) {
      var ds = context.marker.getAttribute('innerHTML');
      if (!ds) throw new Error('Expecting innerHTML data-soruce');
      var value = context.input.serialize();
      this.dde.js.dom.setValue(context.marker.elem, value);
      this.dde.deltas.addDelta('store', ds, value);
    }
    this.getDialog().run(context, [onSubmit, this, [context]]);
  };

});

js.extend('lsn.ext.dde', function (js) {

  this.MarkerList = function (dde) {
    this.dde = dde;
    this.markers = [];
    this.layer = dde.ui.submarkers;
  };

  var MarkerList = this.MarkerList.prototype = {};

  MarkerList.add = function (elem) {
    var klass = js.lsn.ext.dde.markers.InlineMarker;
    var attrs = null;
    this.markers.push(new klass(this.dde, elem, attrs));
  };

  MarkerList.clear = function () {
    js.dom.removeChildren(this.layer);
  };

});

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

js.extend('lsn.ext.dde', function (js) {

  this.BlockInfo = function () {
    js.data.Node.apply(this, [new Object()]);
    this.data.begin = null;
    this.data.end = null;
  };

  this.BlockInfo.prototype = js.lang.createMethods(js.data.Node);

  js.util.overlay(this.BlockInfo.prototype, {

    setBegin: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      this.data.begin = {'cnode':cnode, 'attrs':attrs.toObject()};
    },

    addItem: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      var node = this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
      this.captureElements(node.previousSibling, cnode);
    },

    setEnd: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      this.data.end = {'cnode':cnode, 'attrs':attrs.toObject()};
      if (!this.lastChild) {
        // There are no items in this for block.
        this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
      } else if (this.data.begin.attrs['from']) {
        var node = this.firstChild;
        this.firstChild.removeAllChildren();

        var elem = this.data.begin.cnode.nextSibling;
        while (elem && elem !== cnode) {
          node.appendChild(elem);
          elem = elem.nextSibling;
        }
        js.dom.removeElement(cnode);

        this.removeAllChildren();
        this.appendChild(node);
      } else {
        this.captureElements(this.lastChild, cnode);
      }
    },

    captureElements: function (node, endElem) {
      if (!node) return;
      var elem = node.data.cnode.nextSibling;
      while (elem && elem !== endElem) {
        node.appendChild(elem);
        elem = elem.nextSibling;
      }
      js.dom.removeElement(node.data.cnode);
    }

  });

});

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

js.extend('lsn.ext.dde.markers', function (js) {

  var CBase = js.lsn.ext.dde.markers.Base;

  /**
   * @class InlineMarker
   * Screen marker for editable content.
   */

  this.InlineMarker = function (dde, elem, attrs) {
    CBase.apply(this, [dde, dde.ui.submarkers]);
    this.elem = elem;
    this.pos = new this.dde.js.lsn.ext.dde.Position(elem);
    if (elem.tagName == 'IMG') {
      this.attrs = new js.data.HashList(
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

  var InlineMarker = this.InlineMarker.prototype = js.lang.Methods(CBase);

  InlineMarker.getBoundingBox = function () {
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
    return pos;
    */
  };

  InlineMarker.onClick = function (event) {
    this.editor = new js.lsn.ext.dde.InlineImageEditor(this.dde, this);
    this.editor.begin();
  };

  InlineMarker.onMouseOver = function (event) {
  };

  InlineMarker.onMouseOut = function (event) {
  };

});

js.extend('lsn.ext.dde', function (js) {

  this.PopupMenu = function (dde, children) {
    this.dde = dde;
    this.active = false;
    this.celem = js.dom.createElement('div');
    this.elem = js.dom.createElement('div', {
      'class': 'popupmenu',
      'style': {'position':'absolute'}
    },
      ['table',['tbody',['tr',['td',[this.celem]]]]]
    );
    this.children = children;
    if (this.children) js.dom.appendChildren(this.celem, this.children);
    this.clickMask = new js.lsn.Mask({'opacity':0});
    js.dom.addEventListener(this.clickMask.ui, 'click', this.hide, this);
  };

  this.PopupMenu.prototype = {

    isActive: function () {
      return this.active;
    },

    show: function (event) {
      this.clickMask.show();
      this.dde.refreshMasks();
      var pointer = this.dde.js.dom.getEventPointer(event);
      this.dde.js.dom.stopEvent(event);
      var l = pointer.x;
      var t = pointer.y + [#../dde.html/menubar/height];
      js.dom.setStyle(this.elem, 'top', t + 'px');
      js.dom.setStyle(this.elem, 'left', l + 'px');
      js.dom.getBody().appendChild(this.elem);
      this.active = true;
    },

    hide: function () {
      js.dom.removeElement(this.elem);
      this.clickMask.hide();
      this.active = false;
    },

    exec: function (event, cmd) {
      js.dom.stopEvent(event);
      alert(cmd);
      this.hide();
    }

  };

});

js.extend('lsn.ext.dde.popups', function (js) {

  CPopupMenu = js.lsn.ext.dde.PopupMenu;

  this.Href = function (dde, editor) {
    this.createUI();
    this.editor = editor;
    CPopupMenu.apply(this, [dde, this.ui.root]);
  };

  var proto = this.Href.prototype = js.lang.createMethods(CPopupMenu);

  proto.createUI = function () {
    // DOM elements
    this.ui = new Object();

    // Href Input contol
    this.ui.ctrl = js.dom.createElement('input', {
      onChange: [this.updateHref, this],
      style: {
        'width': '400px'
      }
    });

    // Href Input contol
    this.ui.rel = js.dom.createElement('input', {
      onChange: [this.updateRel, this],
      style: {
        'width': '100px'
      }
    });

    this.ui.btnSitemap = js.dom.createElement('a', {
      onClick: [this.onBtnSitemap, this],
      innerHTML: 'Sitemap',
      style: {
      }
    });

    this.ui.btnAdvanced = js.dom.createElement('a', {
      onClick: [this.onBtnAdvanced, this],
      innerHTML: 'Advanced',
      style: {
      }
    });

    this.ui.advanced = js.dom.createElement('div', {
      style: {
        display: 'none',
        padding: '8px 4px 4px 4px'
      }
    }, [
      'label=rel: ',
      this.ui.rel
    ]);

    // Unlink button
    this.ui.btnUnlink = js.dom.createElement('a=Unlink', {
      'onClick': [this.onUnlink, this]
    });
    // Container for all ui elements
    this.ui.root = js.dom.createElements(
      this.ui.ctrl,
      'div', {
        style: {
          'margin-top': '2px'
        }
      }, [
        this.ui.btnSitemap,
        '#text= | ',
        this.ui.btnAdvanced,
        '#text= | ',
        this.ui.btnUnlink,
      ],
      this.ui.advanced
    );
  };

  proto.updateUI = function () {
    var l = this.dde.js.dom.getLeft(this.target);
    var t = this.dde.js.dom.getBottom(this.target) + [#../dde.html/menubar/height];
    var vp = this.dde.js.dom.getViewportPosition();
    t += 4; // Breathing room
    t -= vp.top;
    l -= vp.left;
    var maxL = vp.width - 440;
    var maxT = vp.width - 60;
    if (l > maxL) l = maxL;
    if (t > maxT) t -= 100;
    js.dom.setStyle(this.elem, 'top', t + 'px');
    js.dom.setStyle(this.elem, 'left', l + 'px');
  };

  proto.show = function (target) {
    if (!this.list) {
      this.list = new js.lsn.ext.dde.FileCombo();
      this.list.attach(this.ui.ctrl);
      this.list.expand('/');
      this.list.addActionListener('userselect', this.onSelect, this);
    }
    this.target = target;
    this.updateUI();
    js.dom.setStyle(this.elem, 'z-index', js.lsn.zIndexAlloc());
    this.dde.uiRoot.appendChild(this.elem);

    var value = this.target ? this.dde.js.dom.getAttribute(this.target, 'href') : '';
    js.dom.setValue(this.ui.ctrl, value);
    var relValue = this.target ? this.dde.js.dom.getAttribute(this.target, 'rel') : '';
    js.dom.setValue(this.ui.rel, relValue);

    this.vScroll = new this.dde.js.dom.EventListener(
      this.dde.js.window, 'scroll', this.onScroll, this
    );
    this.kp = new js.dom.KeyPress();
    this.kp.setHandler('enter', this.finish, this);
    this.kp.setHandler('shift+tab', this.blur, this);
    this.kp.attach(this.ui.ctrl);
    this.list.hide();
    this.active = true;
  };

  proto.appear = function () {
    this.tId = null;
    this.updateUI();
    js.dom.setStyle(this.elem, 'visibility', 'visible');
  };

  proto.onScroll = function (event) {
    if (this.tId) {
      js.dom.clearTimeout(this.tId);
    } else {
      js.dom.setStyle(this.elem, 'visibility', 'hidden');
    }
    this.tId = js.dom.setTimeout(this.appear, 100, this);
  };

  proto.focus = function () {
    this.ranges = this.editor.cc.getRanges();
    this.ui.ctrl.focus();
  };

  proto.blur = function (event) {
    js.dom.stopEvent(event);
    this.ui.ctrl.blur();
    this.ui.rel.blur();
    this.editor.focus();
    if (this.ranges) {
      this.editor.cc.setRanges(this.ranges);
    }
  };

  proto.finish = function (event) {
    this.blur(event);
    this.editor.cc.focusAfter(this.target);
  };

  proto.hide = function () {
    this.kp.detach(this.ui.ctrl);
    this.vScroll.remove();
    js.dom.removeElement(this.elem);
    js.lsn.zIndexFree();
    this.active = false;
  };

  proto.updateHref = function (event) {
    if (!this.target) return;
    this.target.href = this.ui.ctrl.value;
  };

  proto.updateRel = function (event) {
    if (!this.target) return;
    this.target.rel = this.ui.rel.value;
  };

  proto.onSelect = function () {
    this.updateHref();
  };

  proto.onUnlink = function (event) {
    js.dom.stopEvent(event);
    this.hide();
    var editor = this.dde.getEditor();
    if (editor) {
      editor.exec('removeLink');
      this.dde.js.window.focus();
      editor.focus();
    }
  };

  proto.onBtnAdvanced = function (event) {
    js.dom.stopEvent(event);
    js.dom.toggleDisplay(this.ui.advanced);
  };

  proto.onBtnSitemap = function (event) {
    js.dom.stopEvent(event);
    env.dialogs.get('ext-editors-live-select-webpage').run(
      {'value': this.ui.ctrl.value},
      [this.onSelectWebpage, this]
    );
  };

  proto.onSelectWebpage = function (action, values) {
    var selected = values.webpage ? values.webpage.toObject() : null;
    if (selected) {
      var targetUrl = selected['.addr'];
      var entryName = selected['.name'];
      this.ui.ctrl.value = targetUrl;
      this.target.href = targetUrl;
      if (this.target.innerHTML == 'http://') {
        this.target.innerHTML = entryName;
      }
    }
    this.finish();
  };

});

js.extend('lsn.ext.dde.popups', function (js) {

  CPopupMenu = js.lsn.ext.dde.PopupMenu;

  this.Heading = function (dde, editor) {
    this.createUI();
    this.editor = editor;
    CPopupMenu.apply(this, [dde, [this.ui.root]]);
  };

  var _proto = this.Heading.prototype = js.lang.createMethods(CPopupMenu);

  _proto.createUI = function () {

    this.ui = new Object();

    // Input contol
    this.ui.ctrl = js.dom.createElement('INPUT', {
      onChange: [function (event) {
          var ctrl = js.dom.getEventTarget(event);
          var value = js.dom.getValue(ctrl);
          this.setTargetValue(value);
        }, this],
      style: {
        'width': '10em',
        'font-size': '9px'
      }
    });

    this.ui.root = js.dom.createElement('DIV', 
      {style:{margin:'2px'}}, [
      'B=id(#)', {style: {'font-size': '9px'}},
      this.ui.ctrl
    ]);

  };

  _proto.updateUI = function () {
    var l = this.dde.js.dom.getLeft(this.target);
    var t = this.dde.js.dom.getTop(this.target);
    var vp = this.dde.js.dom.getViewportPosition();
    t -= vp.top;
    l -= vp.left;
    t -= js.dom.getHeight(this.elem);
    js.dom.setStyle(this.elem, 'top', t + 'px');
    js.dom.setStyle(this.elem, 'left', l + 'px');
  };

  _proto.show = function (target) {
    this.target = target;
    this.updateUI();
    js.dom.setStyle(this.elem, 'z-index', js.lsn.zIndexAlloc());
    this.dde.uiRoot.appendChild(this.elem);
    var value = this.getTargetValue();
    js.dom.setValue(this.ui.ctrl, value);
    this.vScroll = new this.dde.js.dom.EventListener(
      this.dde.js.window, 'scroll', this.onScroll, this
    );
    this.kp = new js.dom.KeyPress();
    this.kp.setHandler('enter', this.finish, this);
    this.kp.setHandler('tab', this.blur, this);
    this.kp.setHandler('shift+tab', this.blur, this);
    this.kp.attach(this.ui.ctrl);
    this.active = true;
  };

  _proto.appear = function () {
    this.tId = null;
    this.updateUI();
    js.dom.setStyle(this.elem, 'visibility', 'visible');
  };

  _proto.onScroll = function (event) {
    if (this.tId) {
      js.dom.clearTimeout(this.tId);
    } else {
      js.dom.setStyle(this.elem, 'visibility', 'hidden');
    }
    this.tId = js.dom.setTimeout(this.appear, 100, this);
  };

  _proto.focus = function () {
    this.ranges = this.editor.cc.getRanges();
    this.ui.ctrl.focus();
  };

  _proto.blur = function (event) {
    js.dom.stopEvent(event);
    this.ui.ctrl.blur();
    this.editor.focus();
    if (this.ranges) {
      this.editor.cc.setRanges(this.ranges);
    }
  };

  _proto.finish = function (event) {
    this.blur(event);
    this.editor.cc.focusAfter(this.target);
  };

  _proto.hide = function () {
    this.kp.detach(this.ui.ctrl);
    this.vScroll.remove();
    js.dom.removeElement(this.elem);
    js.lsn.zIndexFree();
    this.active = false;
  };

  _proto.getTargetValue = function (value) {
    //this.dde.js.dom.getAttribute(this.target, 'id');
    return this.target ? this.target.id : undefined;
  };

  _proto.setTargetValue = function (value) {
    if (!this.target) return;
    this.target.id = value;
  };

});

js.extend('lsn.ext.dde', function (js) {

  var proto = {};

  this.StatusBar = function (elem) {
    this.ui = js.dom.getElement(elem);
    this.history = [];
    this.timeout = 4000;
    this.tidFlash = null;
  };

  this.StatusBar.prototype = proto;

  proto.set = function (text) {
    this.clear();
    this.history.push(text);
    var elem = js.dom.createElement('span.msg', {'innerHTML': text});
    js.dom.replaceChildren(this.ui, [elem]);
    return elem;
  };

  proto.setChildren = function () {
    this.clear();
    js.dom.replaceChildren(this.ui, arguments);
  };

  proto.clear = function () {
    if (this.tidFlash) js.dom.clearTimeout(this.tidFlash);
    this.tidFlash = null;
    js.dom.removeChildren(this.ui);
  };

  proto.flash = function (text) {
    this.set(text);
    this.tidFlash = js.dom.setTimeout(this.clear, this.timeout, this);
  };

  proto.notify = function (text) {
    env.status.notify(text);
    return;
    var vp = js.dom.getViewportPosition();
    var msgElem = js.dom.createElement('span', {
      'innerHTML': text,
      'style': {'font-size':'12px'}
    });
    js.dom.replaceChildren(this.ui, [msgElem]); // must be part of the DOM for getWidth
    var pad = 12;
    var width = js.dom.getWidth(msgElem) + (2*pad);
    var left = (vp.width/2) - (width/2);
    var wrapElem = js.dom.createElement('div', {
      'class': 'statusNotify',
      'style': {
        'position': 'absolute',
        'top': (vp.height/5) + 'px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    }, [msgElem]);
    js.dom.getBody().appendChild(wrapElem);
    js.dom.setStyle(msgElem, 'visibility', 'visible');
    js.dom.setTimeout(js.dom.removeElement, this.timeout, null, [wrapElem]);
    this.flash(text);
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.Deltas = function (dc) {
    CAction.apply(this);
    this.dc = dc;
    this.queue = new js.data.HashList();
  };

  var Deltas = this.Deltas.prototype = js.lang.createMethods(CAction);

  Deltas.isUpToDate = function () {
    return this.queue.length == 0;
  };

  Deltas.addDelta = function (verb, target, value) {
    if (target.indexOf('/') != 0) {
      alert('Cannot add delta: ' + target);
      return;
    }
    js.lang.assert(target.indexOf('/') == 0);
    // Multiple remove comands are allowed on the same address.  This is
    // because we must adjust the array index.
    //
    // XXX: Server does not check modified time!
    //
    var uniq = verb == 'remove' ? js.util.randomId() : verb + target;
    var key = js.data.md5.sum(uniq);
    var cmd = this.queue.get(key);
    if (cmd) {
      cmd[2] = value;
    } else {
      cmd = this.queue.set(key, js.util.args(arguments));
    }
  };

  var _order = {
    'store':    0,
    'remove':   1,
    'reorder':  2,
    'insert':   3,
    'copy':     4
  };

  Deltas.commit = function () {
    this.dc.batch(this.queue.values().sort(function (a, b) {
      return _order[a[0]] - _order[b[0]];
    }), [this.onComplete, this]);
  };

  Deltas.onComplete = function (result) {
    this.clear();
    this.dispatchAction('complete');
  };

  Deltas.clear = function () {
    this.queue.clear();
  };

});

js.extend('lsn.ext.dde', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;

  var _cookieKey = 'lsn.ext.dde';
  var _cookies = new js.http.Cookies();
  var proto = js.lang.createMethods(CActionDispatcher);

  this.Application = function (uiRoot, menuId, sbId, frameId) {
    CActionDispatcher.apply(this);
    this.saving = null;
    this.baseLoc = new js.http.Location();
    this.docLoc = undefined;
    this.uiRoot = uiRoot;
    this.menuId = menuId;
    this.frameId = frameId;
    this.dc = env.hub;
    this.editor = undefined;
    this.marker = undefined;
    this.js = undefined;
    this.felem = js.dom.getElement(frameId);
    this.frame = js.dom.getFrame(frameId);
    this.status = new js.lsn.ext.dde.StatusBar(sbId);
    this.deltas = null;
    this.markers = [];
    this.masks = [];
    this.monitor = new js.util.Monitor();
    this.editors = {};
    this.mm = new js.lsn.ext.dde.MenuManager(this, this.menuId);
    this.reloadAfterCommit = null;
    this.vLoad = new js.dom.EventListener(this.felem, 'load', this.onFrameLoad, this);
    this.vBeforeUnload = new js.dom.EventListener(js.window, 'beforeunload', this.onBeforeUnload, this);
    this.attachToWindow();
  };

  this.Application.prototype = proto;

  proto.attachToWindow = function () {
    this.js = js.dom.getContentJS(this.felem);
    if (!this.js) return;
    this.js.dom.addEventListener(this.js.window, 'load', function (event) {
      js.console.log('Child window onLoad event.');
    }, this);
    this.js.window.opener = null;
    this.js.window.top = this.js.window.parent = this.js.window;
  };

  proto.disable = function () {
    this.mm.show('none');
  };

  proto.enable = function () {
    this.mm.show('main');
  };

  proto.getDocumentAddress = function () {
    return this.docLoc ? this.docLoc.pathname : null;
  };

  proto.getTargetJS = function () {
    try {
      var doc = js.dom.getContentDocument(this.frame);
      var win = js.dom.getContentWindow(this.frame);
      var tjs = new ECMAScript.Class(win, doc);
      if (!js.http.isSameOrigin(js.document.location.href, doc.location.href)) {
        // For browsers which do not raise an exception
        return null;
      }
      return tjs;
    } catch (ex) {
      // Documents outside this domain will throw an exception when 
      // attempting to access their window and document objects.
      return null;
    }
  };

  proto.onBeforeUnload = function (event) {
    return this.onFrameBeforeUnload(event);
  };

  proto.setLastDocument = function (url) {
    var cookieData = _cookies.getObject(_cookieKey);
    var values = cookieData ? cookieData.toObject() : {};
    values.lastDocument = url;
    _cookies.setObject(_cookieKey, values, 30);
  };

  proto.getLastDocument = function () {
    var cookieData = _cookies.getObject(_cookieKey);
    return cookieData ? cookieData.getValue('lastDocument') : undefined;
  };

  proto.onFrameLoad = function (event) {
    var targetJS = this.getTargetJS();
    var docLoc = targetJS ? new targetJS.http.Location() : null;
    if (this.saving) {
      if (docLoc && docLoc.isSameDocument(this.saving)) {
        this.reloadAfterCommit = this.saving;
      } else {
        js.dom.setTimeout(this.onFrameLoad, 250, this, [event]);
      }
      return;
    }
    this.editors = {};
    this.markers = [];
    this.masks = [];
    if (!targetJS) return this.disable();
    this.js = targetJS;
    this.docLoc = docLoc;
    this.setLastDocument(docLoc.getHref());

    this.mm.show('main');
    // Width of 100% added because kits are setting img width/height values to auto
    this.ui = {
      popups: this.js.dom.createElement('div', {
        id:'dde-popup-layer',
        style:{'position':'absolute', 'z-index': 10000, 'top':0, 'left':0, 'width':'100%'}
      }),
      markers: this.js.dom.createElement('div', {
        id:'dde-marker-layer',
        style:{'position':'absolute', 'z-index': 10000, 'top':0, 'left':0, 'width':'100%'}
      }),
      submarkers: this.js.dom.createElement('div', {
        id:'dde-submarker-layer',
        style:{'position':'absolute', 'z-index': 10000, 'top':0, 'left':0, 'width':'100%'}
      }),
      masks: this.js.dom.createElement('div', {
        id:'dde-mask-layer',
        style:{'position':'absolute', 'z-index': 9999, 'top':0, 'left':0, 'width':'100%'}
      }, this.createMasks())
    };
    this.body = this.js.dom.getBody();
    this.ce = this.js.dom.browser.isIE
      ? this.body
      : this.body.parentNode || this.body;
    /*
     * var node = html element;
     * var marginTop = 0;
     * while (node) {
     *  marginTop += getMarginTop(node);
     *  node = node.firstChild;
     * }
     * 
     */
    if (this.js.dom.getStyle(this.body, 'position') == 'relative') {
      this.body_x = js.util.asInt(this.js.dom.getStyle(this.body, 'margin-top'));
      this.body_y = js.util.asInt(this.js.dom.getStyle(this.body, 'margin-left'));
    } else {
      this.body_x = 0;
      this.body_y = 0;
    }
    //js.console.log('body adjust', this.body_x, this.body_y);
    this.ce.appendChild(this.ui.markers);
    this.ce.appendChild(this.ui.submarkers);
    this.ce.appendChild(this.ui.masks);
    this.ce.appendChild(this.ui.popups);
    this.js.dom.include.style({href:"[#:html:url './masks.css']"});
    this.js.dom.addEventListener(this.js.window, 'resize', this.onWindowResize, this);
//  this.js.dom.addEventListener(this.js.window, 'beforeunload', this.onFrameBeforeUnload, this);
    this.js.dom.addEventListener(this.js.window, 'unload', this.onFrameUnload, this);
    this.doUnload = true;
    this.init();
    this.deltas = new js.lsn.ext.dde.Deltas(this.dc);
    this.deltas.addActionListener('complete', this.onCommitComplete, this);
    this.status.flash('Opened: ' + this.docLoc.getHref());
    this.dispatchAction('open', this);
    js.lsn.hideMask();
  };

  proto.hasChanged = function () {
    return this.deltas ? !this.deltas.isUpToDate() : false;
  };

  proto.onFrameBeforeUnload = function (event) {
    this.doUnload = false;
    if (this.editor) this.deselect();
    if (this.hasChanged()) {
      var msg = 'Your changes will be lost.';
      if (event) {
        event.returnValue = msg;
      }
      return msg;
    }
  };

  proto.onFrameUnload = function (event) {
    if (!this.doUnload) return;
    if (this.editor) this.deselect();
    if (this.monitor) this.monitor.stop();
    if (this.hasChanged()) {
      var msg = 'Save changes?';
      if (confirm(msg)) {
        this.exec('docSave');
      }
    }
  };

  proto.onCommitComplete = function () {
    try {
      this.status.notify('Changes have been saved');
      if (this.reloadAfterCommit) {
        js.dom.setAttribute(this.frameId, 'src', this.reloadAfterCommit);
        this.reloadAfterCommit = null;
        this.js.window.location.reload(true);
      } else {
        // refresh cache for subsequent browser-backs to this page
        js.lsn.hideMask();
        new js.http.Request(this.saving).submit();
      }
    } finally {
      this.saving = null;
    }
  };

  proto.createMasks = function () {
    this.masks = [];
    for (var i = 1; i < 10; i++) {
      var mask = this.js.dom.createElement('div', {
        'id': 'dde-mask-' + i,
        'class': 'dde-mask'
      });
      this.js.dom.setOpacity(mask, .50);
      this.js.dom.addEventListener(mask, 'click', this.deselect, this);
      this.masks.push(mask);
    }
    return this.masks;
  };

  proto.init = function () {
    var elems = []
    this.makeEditableElements(this.js.dom.getBody(), elems);
    this.getEditableElements(this.js.dom.getBody(), elems);
    for (var i = 0, elem; elem = elems[i]; i++) {
      var marker = this.createMarker(elem);
      this.markers.push(marker);
    }
    this.monitor.start();
    //this.adjustMarkers();
  };

  proto.makeEditableElements = function (pelem, result) {
    var comments = this.js.dom.getElementsByNodeType(pelem,
      js.dom.constants.COMMENT_NODE);
    var blocks = [];
    var block = null;
    var spec = null;
    for (var i = 0, cnode; cnode = comments[i]; i++) {
      spec = cnode.data.match(/^ce:ds="([^"]+)"(.*)$/);
      if (spec) {
        var elem = cnode.parentNode;
        var attr = this.js.dom.getAttribute(elem, '_lsn_ds') || '';
        attr += spec[1];
        this.js.dom.setAttribute(elem, '_lsn_ds', attr);
        if (spec[2]) {
          var opts = spec[2].match(/^\s+_lsn_opts="([^"]+)"/);
          if (opts) this.js.dom.setAttribute(elem, '_lsn_opts', opts[1]);
        }
        elem.removeChild(cnode);
        continue;
      }
      spec = cnode.data.match(/^ce:begin="([^"]+)"$/);
      if (spec) {
        if (block) blocks.push(block);
        block = new js.lsn.ext.dde.BlockInfo();
        block.setBegin(cnode, spec[1]);
        continue;
      }
      spec = cnode.data.match(/^ce:item="([^"]+)"$/);
      if (spec) {
        if (!block) throw 'Item outside of block';
        block.addItem(cnode, spec[1]);
        continue;
      }
      spec = cnode.data.match(/^ce:end$/);
      if (spec) {
        block.setEnd(cnode);
        var cluster = block.firstChild;
        while (cluster) {
          result.push(cluster);
          cluster = cluster.nextSibling;
        }
        block = blocks.pop();
        continue;
      }
    }
  };

  proto.getEditableElements = function (pelem, result) {
    for (var i = 0, node = null, nodes = pelem.childNodes; node = nodes[i]; i++) {
      if (!js.dom.node.isElement(node)) continue;
      var ds = js.dom.getAttribute(node, '_lsn_ds');
      if (ds) result.push(node);
      if (node.childNodes.length > 0) this.getEditableElements(node, result);
    }
  };

  proto.createMarker = function (target) {
    var marker = undefined;
    if (js.util.isa(target, js.data.Node)) {
      marker = new js.lsn.ext.dde.markers.BlockMarker(this, target);
    } else {
      marker = new js.lsn.ext.dde.markers.ContentMarker(this, target);
    }
    this.monitor.addTarget(marker);
    return marker;
  };

/*
  // Adjust each marker's position where it is affected by a floating element
  proto.adjustMarkers = function () {
    for (var i = 0, m; m = this.markers[i]; i++) {
      if (!m.elem) continue;
      for (var n = m.elem.previousSibling; n; n = n.previousSibling) {
        if (!this.js.dom.node.isElement(n)) continue;
        var f = this.js.dom.getStyle(n, 'float');
        var c = this.js.dom.getStyle(n, 'clear');
        if (c && c != 'none') break;
        if (this.js.dom.getLeft(m.elem) !=  this.js.dom.getLeft(n)) break;
        if (f && f == 'left') {
          var w = this.js.dom.getWidth(n);
          m.adjust.x = w;
          m.refresh();
          break;
        }
      }
    }
  };
*/

  proto.removeMarker = function (marker) {
    var result = null;
    for (var i = 0, m; m = this.markers[i]; i++) {
      if (m == marker) {
        result = this.markers.splice(i--, 1);
        marker.remove();
        this.monitor.removeTarget(marker);
        break;
      }
    }
    return result;
  };

  proto.removeMarkersFrom = function (elem) {
    var m = this.getMarker(elem);
    if (m) {
      this.removeMarker(m);
    }
    var n = elem.firstChild;
    while (n) {
      this.removeMarkersFrom(n);
      n = n.nextSibling;
    }
  };

  proto.onWindowResize = function (event) {
    this.refreshMarkers();
    if (this.editor) this.editor.resize();
  };

  proto.exec = function () {
    var args = js.util.args(arguments);
    var cmd = args.shift();
    if (!this.cmds[cmd]) throw 'Unknown exec command: ' + cmd;
    this.cmds[cmd].apply(this, args);
  };

  proto.cmds = {

    docOpen: function () {
      if (!this.dlgOpen) {
        this.dlgOpen = new js.hubb.ui.BrowseDialog();
        this.dlgOpen.dlg.addEvent('ok', js.lang.Callback(function () {
          var addr = this.dlgOpen.getTarget().getAddress();
          this.load(addr);
        }, this));
      }
      this.dlgOpen.show(this.docLoc.pathname);
    },

    docSave: function (reload) {

      // We need to reload when:
      //
      //  * Blocks have been moved, inserted, or deleted (as array indexes change)
      //  * An edited element appears elsewehere on the page
      //
      // There is no way of knowing if the edit we made affects a non-editable
      // page component.  We just need to reload each time.
      //
      // The MenuButton for Save cannot pass parameters.
      reload = true;

      if (this.editor) this.deselect();

      if (this.deltas && this.deltas.isUpToDate()) {
        this.status.flash('No save needed');
        return;
      }
      this.saving = this.docLoc.getUri();
      this.reloadAfterCommit = reload ? this.docLoc.getUri() : null;
      js.lsn.showMask();
      js.dom.setTimeout(this.deltas.commit, 0, this.deltas);
    },

    docGoto: function () {
      js.window.open(this.js.window.location.href);
    },

    docViewSource: function () {
      if (this.deltas && !this.deltas.isUpToDate()) {
        if (confirm("Save changes?\n\nViewing source displays the source of the saved document.")) {
          this.deltas.addActionListener('complete', this.cmds.docViewSource, this);
          this.exec('docSave');
        }
        return;
      }
      if (!this.dlgViewSource) {
        this.dlgViewSource = new js.lsn.Dialog('[#`./dlg-view-source.html`]', {'refetch':false});
      }
      this.dlgViewSource.show({'href': this.docLoc.getHref()});
    },

    docMail: function () {
      if (!this.dlgMail) {
        this.dlgMail = new js.lsn.Dialog('[#`./dlg-mail.html`]', {'refetch':false});
        this.dlgMail.addEvent('mail-sent', js.lang.Callback(function () {
          this.status.notify('Mail sent!');
        }, this));
      }
      this.dlgMail.show({'href': this.docLoc.getHref()});
    },

    docRefresh: function () {
      if (this.editor) this.deselect();
      if (this.deltas && !this.deltas.isUpToDate()) {
        var msg = 'Save changes';
        if (confirm(msg)) {
          // Location will be reloaded when the commit completes
          this.exec('docSave');
          return;
        } else {
          // Clearing the deltas will prevent the frame unload events from
          // prompting for save.
          this.deltas.clear();
        }
      }
      try {
        this.js.document.location.reload(true);
      } catch (ex1) {
        try {
        this.js.window.location.reload(true);
        } catch (ex2) {
          this.status.flash('Could not reload');
        }
      }
    },

    stopEditing: function () {
      this.deselect();
    }

  };

  proto.load = function (uri) {
    this.felem.src = uri;
  };

  proto.canUnload = function () {
    if (!this.deltas) return true;
    return !this.deltas.isUpToDate() ? !confirm('Save changes?') : true;
  };

  proto.refresh = function () {
    this.refreshMarkers();
    this.refreshMasks();
  };

  proto.refreshMarkers = function () {
    this.monitor.poll();
  };

  proto.showMarkers = function () {
    this.js.dom.setStyle(this.ui.markers, 'display', '');
  };

  proto.hideMarkers = function () {
    js.dom.setStyle(this.ui.markers, 'display', 'none');
  };

  proto.getMarker = function (elem) {
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      if (elem === marker.elem) {
        return marker;
      }
    }
  };

  proto.showMask = function (marker) {
    this.marker = marker;
    this.refresh();
    this.js.dom.setStyle(this.ui.masks, 'display', '');
  };

  proto.hideMask = function () {
    js.dom.setStyle(this.ui.masks, 'display', 'none');
    if (this.maskType) {
      js.dom.removeClassName(this.ui.masks, this.maskType);
      this.maskType = null;
    }
    this.marker = null;
  };

  proto.setMaskType = function (type) {
    this.maskType = type;
    js.dom.addClassName(this.ui.masks, this.maskType);
  };

  proto.selectNext = function () {
    if (!this.marker) return;
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      if (marker === this.marker) {
        for (var j = 1, next; next = this.markers[i + j]; j++) {
          if (next.getType() == 'text') {
            this.deselect();
            next.onClick();
            break;
          }
        }
        break;
      }
    }
  };

  proto.selectPrevious = function () {
    if (!this.marker) return;
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      if (marker === this.marker) {
        for (var j = 1, prev; prev = this.markers[i - j]; j++) {
          if (prev.getType() == 'text') {
            this.deselect();
            prev.onClick();
            break;
          }
        }
        break;
      }
    }
  };

  proto.select = function (marker, cmd) {
    this.editor = marker.getEditor();
    if (!this.editor) return;
    js.dom.addClassName(this.ui.masks, 'shaded');
    this.editor.begin(cmd);
    this.marker = marker;
    this.hideMarkers();
  };

  proto.deselect = function () {
    if (this.editor) {
      this.editor.end();
      this.editor = null;
      this.mm.show('main');
    }
    this.marker = null;
    this.hideMask();
    js.dom.removeClassName(this.ui.masks, 'shaded');
    this.showMarkers();
    this.js.dom.getBody().focus();
    this.refresh();
  };

  proto.getEditor = function () {
    return this.editor;
  };

  proto.refreshMasks = function () {

    if (!this.js) return; // when used as a setTimeout callback
    if (!this.marker) return;
    var pos = this.marker.getBoundingBox();
    var pg_h = this.js.dom.canvas.pageY() - this.body_y;
    var pg_w = this.js.dom.canvas.pageX() - this.body_x;

    /*
          w1   w2   w3  
        .----.----.----. t1
     h1 |    |    |    |
        |----+----+----| t2
     h2 |    |****|    |
        |----+----+----| t3
     h3 |    |    |    |
        '----+----+----'
        ^    ^    ^
        l1   l2   l3
     */

    var w1 = pos.left + this.body_x;
    var w2 = pos.width;
    var w3 = pg_w - (pos.left + pos.width);

    var h1 = pos.top + this.body_y;
    var h2 = pos.height;
    var h3 = pg_h - (pos.top + pos.height);

    var l1 = 0
    var l2 = l1 + w1;
    var l3 = l1 + w1 + w2;

    var t1 = 0
    var t2 = t1 + h1;
    var t3 = t1 + h1 + h2;

    this.updmsk(this.masks[0], t1, l1, w1, h1);
    this.updmsk(this.masks[1], t1, l2, w2, h1);
    this.updmsk(this.masks[2], t1, l3, w3, h1);
    this.updmsk(this.masks[3], t2, l1, w1, h2);
    this.updmsk(this.masks[4], t2, l2, w2, h2);
    this.updmsk(this.masks[5], t2, l3, w3, h2);
    this.updmsk(this.masks[6], t3, l1, w1, h3);
    this.updmsk(this.masks[7], t3, l2, w2, h3);
    this.updmsk(this.masks[8], t3, l3, w3, h3);

  };

  proto.scrollToMarker = function (marker) {
    if (!marker) marker = this.marker;
    if (!marker) return;
    var pos = this.marker.getBoundingBox();
    var vp = this.js.dom.getViewportPosition();
    if (pos.top < vp.top) {
      var y = Math.max(0, pos.top - (vp.height/3));
      this.js.window.scroll(vp.left, y);
    } else if (pos.top > (vp.top + vp.height)) {
      this.js.window.scroll(vp.left, (pos.top - pos.height));
    }
  };

  proto.updmsk = function (elem, t, l, w, h) {
    this.js.dom.setStyle(elem, 'top',    t + 'px');
    this.js.dom.setStyle(elem, 'left',   l + 'px');
    this.js.dom.setStyle(elem, 'width',  w + 'px');
    this.js.dom.setStyle(elem, 'height', h + 'px');
  };

});

