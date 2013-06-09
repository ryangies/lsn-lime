/*
 * Either obsolete or a refactor... not sure
 *
 */
js.extend('lsn.ext.dde', function (js) {

  /** Class definition */

  var proto = {}; // class prototype

  this.Masks = function (dde) {
    this.dde = dde;
    this.marker = null;
    this.interval = 100; // ms
    this.iid = null; // interval id
    this.masks = [];
    this.ui = this._createUI();
  };

  this.Masks.prototype = proto;

  /** Public methods */

  proto.select = function (marker) {
    this.marker = marker;
    this._startPolling();
  };

  proto.deselect = function () {
    _stopPolling();
    this.marker = null;
  };

  proto.highlight = function () {
  };

  /** Private methods */

  proto._createUI = function () {
    return this.dde.js.dom.createElement('div', {
      id:'dde-mask-layer',
      style:{'position':'absolute', 'z-index': 9999, 'top':0, 'left':0}
    }, this._createMasks())
  };

  proto._createMasks = function () {
    this.masks = [];
    for (var i = 1; i < 10; i++) {
      var mask = this.dde.js.dom.createElement('div', {
        'id': 'dde-mask-' + i,
        'class': 'dde-mask'
      });
      this.dde.js.dom.setOpacity(mask, .50);
      this.dde.js.dom.addEventListener(mask, 'click', this.dde.deselect, this);
      this.masks.push(mask);
    }
    return this.masks;
  };

  proto._startPolling = function () {
    this.iid = this.dde.js.dom.setInterval(this._resize, this.interval, this); 
  };

  proto._stopPolling = function () {
    if (this.iid) this.dde.js.dom.clearInterval(this.iid); 
    this.iid = null;
  };

  proto._resize = function () {
  };

});
