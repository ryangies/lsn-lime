ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var _defs = [#:json ./menubar.hf];

  this.MenuManager = ecma.lang.createConstructor();

  this.MenuManager.prototype = {

    construct: function (dde, ce) {
      this.dde = dde;
      this.active = null;
      this.mb = null;
      this.ce = ce;
      // parse button definitions into objects
      this.groups = {};
      for (var id in _defs) {
        var props = _defs[id];
        this.groups[id] = new ecma.lsn.ext.dde.MenuBar(dde, props);
      }
    },

    show: function (id) {
      var args = ecma.util.args(arguments);
      args.shift(); // id
      if (this.active != id) {
        this.mb = this.groups[id];
        if (!this.mb) throw 'no such menubar';
        ecma.dom.replaceChildren(this.ce, this.mb.getElements());
        this.active = id;
      }
      this.mb.onShow(args);
    },

    hide: function () {
      ecma.dom.removeElement(this.mb);
      this.mb = null;
    }

  };

});
