js.extend('lsn.ext.wireframe.ui', function (js) {

  this.Switcher = function (app) {
    this.app = app;
    this.items = [];
    this.selected = null;
    app.addActionListener('onPageLoad', this.attach, this);
  };

  var Switcher = this.Switcher.prototype = js.lang.createMethods();

  Switcher.addView = function (targetId, handleId) {
    this.items.push([targetId, handleId]);
  };

  Switcher.attach = function (action) {
    if (this.items.length) {
      for (var i = 0, item; item = this.items[i]; i++) {
        new js.dom.EventListener(item[1], 'click', this.onSwitchView, this, [i]);
      }
      this.select(0);
    }
  };

  Switcher.onSwitchView = function (event, index) {
    js.dom.stopEvent(event);
    this.select(index);
  };

  Switcher.select = function (index) {
    if (this.selected !== null) {
      var item = this.items[this.selected];
      js.dom.setStyle(item[0], 'visibility', 'hidden');
      js.dom.removeClassName(item[1], 'selected');
    }
    var item = this.items[index];
    js.dom.setStyle(item[0], 'visibility', 'visible');
    js.dom.addClassName(item[1], 'selected');
    this.selected = index;
  };

});
