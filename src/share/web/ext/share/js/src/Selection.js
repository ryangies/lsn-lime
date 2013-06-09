/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var CActionDispatcher = js.action.ActionDispatcher;

  /**
   * @class Selection
   */

  this.Selection = function () {
    CActionDispatcher.apply(this);
    this.cwd = null;
    this.selection = [];
  };

  var _proto = this.Selection.prototype = js.lang.createMethods(
    CActionDispatcher
  );

  /**
   * @function setCwd
   */

  _proto.setCwd = function (target) {
    if (this.cwd !== target) {
      this.clearSelection();
      if (this.cwd) {
        target.dispatchAction('onDeselectCwd', this.cwd);
      }
      this.cwd = target;
      target.dispatchAction('onSelectCwd', this.cwd);
      this.dispatchAction('onChangeDirectory', this.cwd);
    }
  };

  /**
   * @function getSelection
   */

  _proto.getSelection = function () {
    return this.selection;
  };

  /**
   * @function getSelected
   * Singular form
   */

  _proto.getSelected = function () {
    return this.selection[0];
  };

  /**
   * @function getCwd
   */

  _proto.getCwd = function () {
    return this.cwd;
  };

  /**
   * @function select
   */

  _proto.select = function (target) {
    this.clearSelection();
    this.multiSelect(target);
  };

  /**
   * @function multiSelect
   */

  _proto.multiSelect = function (target) {
    this.selection.push(target);
    target.dispatchAction('onSelect');
    this.dispatchAction('onSelect', target);
  };

  /**
   * @function deselect
   */

  _proto.deselect = function (target) {
    for (var i in this.selection) {
      if(this.selection[i] === target) {
        this.selection.splice(i, 1);
        target.dispatchAction('onDeselect', target);
        this.dispatchAction('onDeselect', target);
      }
    }
  };

  /**
   * @function clearSelection
   */

  _proto.clearSelection = function () {
    while (this.selection.length > 0) {
      var target = this.selection.pop();
      target.dispatchAction('onDeselect', target);
      this.dispatchAction('onDeselect', target);
    }
  };

});
