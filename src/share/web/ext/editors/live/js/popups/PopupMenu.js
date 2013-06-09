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
