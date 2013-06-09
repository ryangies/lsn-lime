js.extend('lsn.hashtable.edit', function (js) {

  var CInputBase = js.lsn.forms.InputBase;

  this.InputSelect = function (elem, dataSource) {
    CInputBase.apply(this, [elem]);
    this.load(dataSource);
  };

  var InputSelect = this.InputSelect.prototype = js.lang.createMethods(CInputBase);

  InputSelect.load = function (dataSource) {
    if (js.util.isObject(dataSource)) {
      this.createOptions(dataSource);
    } else {
      js.hubb.getInstance().fetch(dataSource, [this.onLoad, this]);
    }
  };

  InputSelect.onLoad = function (dnode) {
    this.createOptions(dnode.toObject());
  };
      
  InputSelect.createOptions = function (options) {
    if (js.util.isAssociative(options)) {
      for (var value in options) {
        this.addItem(value, options[value]);
      }
    } else if (js.util.isArray(options)) {
      for (var i = 0, opt; opt = options[i]; i++) {
        if (typeof(opt) === 'string') {
          this.addItem(opt, opt);
        } else {
          this.addItem(opt.value, opt.text);
        }
      }
    }
    // Rewrite the value now that the options are present (caller may setValue 
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

  InputSelect.addItem = function (value, text) {
    var option = js.dom.createElement('OPTION', {
      'value': value,
      'innerHTML': text
    });
    js.dom.appendChild(this.elem, option);
  };

});
