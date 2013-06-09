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
    ///js.console.log('onPaste');
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
      ///js.console.log(ex);
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
      ///js.console.log(ex);
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
    ///js.console.log('watching for paste', this.watchCount);
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
