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
