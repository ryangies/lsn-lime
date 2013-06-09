/** @namespace ext.share.data.model */
js.extend('ext.share.data.model', function (js) {

  var _package = this;

  /**
   * @class Selectable
   */

  _package.Selectable = function (selection) {
  };

  var _proto = _package.Selectable.prototype = js.lang.createMethods(
  );

  /**
   * @function select
   */

  _proto.select = function () {
    this.rootNode.select(this);
  };

  /**
   * @function isSelected
   */

  _proto.isSelected = function () {
    var me = this;
    function matchFunction (unk) {return unk === me;}
    return js.util.grep(matchFunction, this.rootNode.getSelection());
  };

  /**
   * @function multiSelect
   */

  _proto.multiSelect = function () {
    this.rootNode.multiSelect(this);
  };

  /**
   * @function deselect
   */

  _proto.deselect = function () {
    this.rootNode.deselect(this);
  };

});
