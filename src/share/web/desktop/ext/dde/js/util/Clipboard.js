ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var _watchInterval = 50; // Milliseconds to check for changes
  var _maxWatchCount = 10; // Maximum number of checks before bailing

  var proto = {};

  this.Clipboard = function (cc, editor) {
    this.cc = cc; // ContentController for the editable element
    this.editor = editor; // Editor which can receive focus
    this.target = null; // Focus element (which will receive the paste)
    this.pasteEvent = null;
  };

  this.Clipboard.prototype = proto;

  proto.attach = function (elem) {
    this.target = elem;
    this.pasteEvent = new ecma.dom.EventListener(
      this.target, 'paste', this.onPaste, this
    );
  };

  proto.detach = function () {
    if (this.pasteEvent) this.pasteEvent.remove();
  };

  proto.onPaste = function (event) {
    ///ecma.console.log('onPaste');
    new PasteFilter(this);
  };

  /** 
   * PasteFilter
   */

  function PasteFilter (clipboard) {
    this.cc = clipboard.cc;
    this.editor = clipboard.editor;
    this.target = clipboard.target;
    this.watchCount = 0; // Limits watch mechanism
    this.watchId = null; // Timeout identifier for clearing
    this.scrubber = new ecma.dom.Scrubber(ecma);
    this.cursor = null;
    this.begin();
  }

  PasteFilter.prototype.begin = function () {
    this.editor.stopMonitor();
    this.cursor = ecma.dom.createElement('#comment=PASTE');
    this.cc.insertElement(this.cursor);
    this.bucket = ecma.dom.createElement('div', {
      'contentEditable': 'true',
      'style': {
        'position': 'fixed',
        'top': '0'
      }
    });
    ecma.dom.setOpacity(this.bucket, 0);
    ecma.dom.getBody().appendChild(this.bucket);
    this.bucket.focus();
    this.beginWatch();
  };

  PasteFilter.prototype.afterPaste = function () {
    try {
      // Scrub the pasted fragment
      this.scrubber.scrub(this.bucket);
      // Move pasted nodes from paste bucket to target
      var last = null;
      while (this.bucket.hasChildNodes()) {
        var node = this.bucket.firstChild;
        try {
          if (node === last) throw 'Element not inserted';
          ecma.dom.insertBefore(node, this.cursor);
          last = node;
        } catch (ex) {
          if (this.bucket.firstChild === node) {
            // Could not insert node in hierarchy
            ecma.dom.removeElementOrphanChildren(this.bucket.firstChild);
          }
        }
      }
    } catch (ex) {
      ///ecma.console.log(ex);
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
      ///ecma.console.log(ex);
    } finally {
      ecma.dom.removeElements(this.bucket, this.cursor);
      this.editor.startMonitor();
    }
  };

  PasteFilter.prototype.hasChanged = function () {
    return this.bucket.hasChildNodes();
  };

  PasteFilter.prototype.watchForPaste = function () {
    ///ecma.console.log('watching for paste', this.watchCount);
    if (this.watchCount < _maxWatchCount) {
      this.watchCount++;
      if (!this.hasChanged()) {
        this.watchId = ecma.dom.setTimeout(this.watchForPaste, _watchInterval, this);
        return;
      }
    }
    ecma.dom.setTimeout(this.endWatch, _watchInterval, this);
  };

  PasteFilter.prototype.beginWatch = function () {
    this.watchCount = 0;
    this.watchId = ecma.dom.setTimeout(this.watchForPaste, _watchInterval, this);
  };

  PasteFilter.prototype.endWatch = function () {
    ecma.dom.clearTimeout(this.watchId);
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
