js.extend('lsn.ext.dde.popups', function (js) {

  CPopupMenu = js.lsn.ext.dde.PopupMenu;

  this.Heading = function (dde, editor) {
    this.createUI();
    this.editor = editor;
    CPopupMenu.apply(this, [dde, [this.ui.root]]);
  };

  var _proto = this.Heading.prototype = js.lang.createMethods(CPopupMenu);

  _proto.match = function (elem) {
    return /^H[123456]$/.test(elem.tagName)
  };

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
    this.target = undefined;
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
