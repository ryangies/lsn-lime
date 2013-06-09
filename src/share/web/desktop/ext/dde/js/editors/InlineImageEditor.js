ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var CImageEditor = ecma.lsn.ext.dde.ImageEditor;

  this.InlineImageEditor = function () {
    CImageEditor.apply(this, arguments);
  };

  var InlineImageEditor =
  this.InlineImageEditor.prototype = ecma.lang.createMethods(
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

  /**
   * @function enableHyperlink
   *
   * Wrap the target image in an anchor tag
   */

  InlineImageEditor.enableHyperlink = function () {
    if (this.isHyperlinked()) return;
    this.hyperlink = this.js.dom.createElement('A');
    this.js.dom.insertBefore(this.target, this.hyperlink)
    this.js.dom.appendChild(this.hyperlink, this.target);
  };

  /**
   * @function disableHyperlink
   *
   * Remove the anchor wrapper.
   */

  InlineImageEditor.disableHyperlink = function () {
    if (!this.isHyperlinked()) return;
    this.js.dom.removeElementOrphanChildren(this.hyperlink);
    this.hyperlink = null;
  };

});
