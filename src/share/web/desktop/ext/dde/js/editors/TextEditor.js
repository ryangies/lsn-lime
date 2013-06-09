ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CEditor = ecma.lsn.ext.dde.Editor;

  this.TextEditor = function (dde) {
    // TODO: IE 9 supports the CE interface and a few bugs need to be worked out
    if (ecma.dom.browser.isIE) throw 'Unsupported browser';
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
    this.submarkers = new ecma.lsn.ext.dde.MarkerList(
      dde, ecma.lsn.ext.dde.markers.InlineMarker
    );
    this.hrefPopup = new ecma.lsn.ext.dde.popups.Href(dde, this);
  };

  var TextEditor = this.TextEditor.prototype = ecma.lang.createMethods(
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
    if (this.target.innerHTML != this.originalValue) {
      this.recordChanges();
    } else if (this.target.tagName == 'A') {
      var href = this.dde.js.dom.getAttribute(this.target, 'href');
      if (this.originalHref != href) {
        this.recordChanges();
      }
    }
    this.dde.status.clear();
    if (this.hrefPopup.isActive()) this.hrefPopup.hide();
//    this.vFocus.remove();
  };

  TextEditor.recordChanges = function () {
    var elem = this.target;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = ecma.dom.getAttribute(elem, name);
      var val = ecma.data.entities.decode(raw);
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
    this.monitorId = ecma.dom.setInterval(this.monitorCallback, 250, this);
    this.monitorCallback();
  };

  TextEditor.stopMonitor = function () {
    ecma.dom.clearInterval(this.monitorId);
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
    var menuId = 'text';
    var menuElem = this.focusElement;
    var spath = [];
    var isAnchor = false;
    for (var i = 0, elem; elem = stack[i]; i++) {
      spath.unshift(elem.tagName);
      if (elem.tagName == 'A') {
        if (elem === this.target && !ecma.util.grep('href', this.marker.attrs.keys())) {
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
    }
    if (!isAnchor && this.hrefPopup.isActive()) this.hrefPopup.hide();
    var pathMenu = [];
    var lastIdx = spath.length - 1;
    for (var i = 0, tagName; tagName = spath[i]; i++) {
      var elem = ecma.dom.createElement('span=' + tagName);
      if (i > 0) {
        elem.appendChild(ecma.dom.createElement('a', {
          'onClick': [this.onSplice, this, [lastIdx - i]],
          'title': 'Unwrap this node (remove it but not its children)',
          'href': '#',
          'style': {'color':'red', 'text-decoration':'none'}
        }, ['sub=(x)']));
      }
      pathMenu.push(elem);
      if (spath[i + 1]) pathMenu.push(ecma.dom.createElement('#text= > '));
    }
//    this.dde.status.set(spath.join(' > '));
    this.dde.status.setChildren(pathMenu);
    this.dde.mm.show(menuId, menuElem, stack, cmd);
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
        var dlg = new ecma.lsn.Dialog('[#`./dlg-edit-html.html`]', {'refetch':false});
        dlg.show({'js': this.dde.js, 'target': this.target, 'editor': this});
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
    } else {
      this.cc.exec(name);
    }
    this.updateUI(name);
  };

  TextEditor.showDialog = function (url) {
    if (!this.dlgs[url]) {
      this.dlgs[url] = new ecma.lsn.Dialog(url, {'refetch':false});
    }
    this.dlgs[url].show({
      'js': this.dde.js,
      'target': this.target,
      'editor': this
    });
  };

  TextEditor.onSplice = function (event, idx) {
    ecma.dom.stopEvent(event);
    var stack = this.cc.getElementStack(this.focusElement);
    var elem = stack[idx];
    ecma.console.log('splice', idx, elem);
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
      if (fc && ecma.dom.node.isElement(fc) && fc.tagName == 'BR' && ecma.dom.hasClassName(fc, 'stub')) {
        // Placeholder inserted by web server
        this.placeholders.push(fc);
      } else {
        // Select first text node
        var textNode = ecma.dom.findNode(this.target, function (n) {
          return ecma.dom.node.isText(n);
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
    ///js.console.log('Enforcing paragraphs');
    var node = this.target.firstChild;
    var orphans = [];
    function adoptOrphans (orphans) {
      if (!orphans.length) return;
      var para = js.dom.createElement('P');
      js.dom.insertBefore(para, orphans[0]);
      js.dom.appendChildren(orphans, para);
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
        if (!ecma.dom.node.isElement(node)) break;
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
