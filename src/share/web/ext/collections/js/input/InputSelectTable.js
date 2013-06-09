/** @namespace ext.share.input */
js.extend('ext.share.input', function (js) {

  var _package = this;
  var CInputBase = this.InputBase;

  _package.InputSelectTable = function (params) {
    CInputBase.apply(this, [params]);
    this.value = this.emptyValue = null;
    this.options = [];
    this.map = [];
    this.table = new js.lsn.hashtable.model.Root();
    this.als = [
      this.table.addActionListener('load', this.onTableLoad, this),
      this.table.addActionListener('create', this.doAddItem, this),
      this.table.addActionListener('remove', this.doRemoveItem, this)
    ];
    this.table.load(this.params.dataSource);
  };

  var _proto = _package.InputSelectTable.prototype = js.lang.createMethods(CInputBase);

  _package.factory.set('join', _package.InputSelectTable);

  _proto.createElements = function () {
    return [this.attach(js.dom.createElement('SELECT'))];
  }

  _proto.onTableLoad = function (action, table) {
    // Rewrite the value now that the options are present (caller may setValue 
    // before the load operation completes).
    if (this.value !== this.emptyValue) this.write();
  };

  _proto.doAddItem = function (action, item) {
    var title = item.getDisplayField();
    var option = js.dom.createElement('OPTION', {
      'value': item.getKey(),
      'innerHTML': title.toString()
    });
    this.map.push([item, option, title]);
    this.als.push(title.addActionListener('change', this.doUpdateTitle, this, [option]));
    js.dom.appendChild(this.elem, option);
  };

  _proto.doRemoveItem = function (action, item) {
    var optionValue = null;
    for (var i = 0, pair; pair = this.map[i]; i++) {
      if (pair[0] === item) {
        var option = pair[1];
        optionValue = js.dom.getAttribute(option, 'value');
        js.dom.removeElement(option);
        break;
      }
    }
    if (optionValue !== null && this.value === optionValue) {
      try {
        this.setValue(this.map[0][0].getKey());
      } catch (ex) {
        this.reset();
      }
    }
  };

  _proto.doUpdateTitle = function (action, title) {
    for (var i = 0, pair; pair = this.map[i]; i++) {
      if (pair[2] === title) {
        var option = pair[1];
        option.innerHTML = title.toString();
        break;
      }
    }
  };

  _proto.detach = function () {
    CInputBase.prototype.detach.apply(this);
    for (var i = 0, al; al = this.als[i]; i++) {
      al.remove();
    }
  };

});
