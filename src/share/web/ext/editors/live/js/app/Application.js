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
