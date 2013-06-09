/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;

  var IItem = [ 'getName', 'load', 'show', 'hide' ];

  /**
   * @class SwitchList
   */

  this.SwitchList = function (appendToId) {
    CActionDispatcher.apply(this);
    this.appendToId = appendToId;
    this.selected = null;
    this.items = [];
  };

  var SwitchList = this.SwitchList.prototype = js.lang.createMethods(
    CActionDispatcher
  );

  /**
   * @function add
   */

  SwitchList.add = function (item) {
    js.lang.assert(js.lang.hasMethods(item, IItem), 'item must be an IItem');
    this.items.push(item);
    item.addActionListener('onClose', this.onItemClose, this);
    this.executeAction('onAdd', item);
    return item;
  };

  SwitchList.onItemClose = function (action, item) {
    this.remove(item);
  };

  /**
   * @function remove
   */

  SwitchList.remove = function (item) {
    for (var i = 0; i < this.items.length; i++) {
      if (item === this.items[i]) {
        this.items.splice(i, 1);
        if (item === this.selected) {
          this.deselect();
          this.executeAction('onRemove', item); // After deselect
          var j = i;
          var next;
          while (j >= 0 && !next) {
            next = this.getAt(j--);
          }
          if (next) this.select(next);
        } else {
          this.executeAction('onRemove', item);
        }
        return i;
      }
    }
  };

  SwitchList.getAt = function (index) {
    return this.items[index];
  };

  /**
   * @function get
   */

  SwitchList.get = function (name) {
    for (var i = 0, item; item = this.items[i]; i++) {
      if (item.getName() == name) return item;
    }
  };

  /**
   * @function select
   */

  SwitchList.select = function (/*...*/) {
    var args = js.util.args(arguments);
    var item = args.shift();
    var selected = this.getSelected();
    if (selected === item) {
      if (selected) {
        var func = selected.reload || selected.load; // Calling .load is deprecated
        func.apply(selected, args);
      }
    } else {
      this.deselect();
      this.selected = item;
      item.show(js.dom.getElement(this.appendToId), [function () {
        this.executeAction('onSelect', item);
        item.load.apply(item, args);
      }, this]);
    }
    return this.selected;
  };

  /**
   * @function deselect
   */

  SwitchList.deselect = function () {
    var item = this.getSelected();
    if (item) {
      item.hide();
      this.selected = null;
      this.executeAction('onDeselect', item);
      return item;
    } else {
      return null;
    }
  };

  /**
   * @function getSelected
   */

  SwitchList.getSelected = function () {
    return this.selected;
  };

});
