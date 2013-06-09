/** @namespace lsn.ext.dde */
js.extend('lsn.ext.dde', function (js) {

  /**
   * @class Editor
   */

  this.Editor = function (dde, marker) {
    this.dde = dde;
    this.marker = null;
    this.target = null;
    if (marker) this.setMarker(marker);
  };

  var Editor = this.Editor.prototype = js.lang.createMethods();

  /**
   * @function exec
   */

  Editor.exec = function (cmd) {
  };

  /**
   * @function setMarker
   */

  Editor.setMarker = function (marker) {
    this.marker = marker;
    this.target = marker.elem;
    return this.marker;
  };

  /**
   * @function recordChanges
   */

  Editor.recordChanges = function (data) {
    throw js.error.abstract();
  };

  Editor.begin = function () {
  };

  Editor.end = function () {
  };

});
