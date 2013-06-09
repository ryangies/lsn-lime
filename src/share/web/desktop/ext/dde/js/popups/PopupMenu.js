ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  this.PopupMenu = function (dde, children) {
    this.dde = dde;
    this.active = false;
    this.celem = ecma.dom.createElement('div');
    this.elem = ecma.dom.createElement('div', {
      'class': 'popupmenu',
      'style': {'position':'absolute'}
    },
      ['table',['tbody',['tr',['td',[this.celem]]]]]
    );
    this.children = children;
    if (this.children) ecma.dom.appendChildren(this.celem, this.children);
    this.clickMask = new ecma.lsn.Mask({'opacity':0});
    ecma.dom.addEventListener(this.clickMask.ui, 'click', this.hide, this);
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
      var t = pointer.y + [#../index.html/menubar/height];
      ecma.dom.setStyle(this.elem, 'top', t + 'px');
      ecma.dom.setStyle(this.elem, 'left', l + 'px');
      ecma.dom.getBody().appendChild(this.elem);
      this.active = true;
    },

    hide: function () {
      ecma.dom.removeElement(this.elem);
      this.clickMask.hide();
      this.active = false;
    },

    exec: function (event, cmd) {
      ecma.dom.stopEvent(event);
      alert(cmd);
      this.hide();
    }

  };

});
