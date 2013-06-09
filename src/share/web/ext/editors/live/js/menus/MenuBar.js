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
