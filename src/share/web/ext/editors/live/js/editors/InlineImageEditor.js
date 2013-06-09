js.extend('lsn.ext.dde', function (js) {

  var CImageEditor = js.lsn.ext.dde.ImageEditor;

  this.InlineImageEditor = function () {
    CImageEditor.apply(this, arguments);
  };

  var InlineImageEditor =
  this.InlineImageEditor.prototype = js.lang.createMethods(
    CImageEditor
  );

  /**
   * @function canRemove
   *
   * Inline elements may be removed.
   */

  InlineImageEditor.canRemove = function () {
    return true;
  };

  /**
   * @function recordChanges
   *
   * Inline elements do not store directly, as they're simply content of
   * a greater, storable element.
   */

  InlineImageEditor.recordChanges = function (data) {
  };

  /**
   * @function onRemove
   *
   * Called when the user clicks the Delete button.
   */

  InlineImageEditor.onRemove = function (event) {
    if (confirm('Are you sure?')) {
      this.onCancel();
      this.end();
      this.dde.js.dom.removeElement(this.target);
    }
  };

});
