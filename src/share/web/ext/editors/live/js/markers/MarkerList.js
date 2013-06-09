js.extend('lsn.ext.dde', function (js) {

  this.MarkerList = function (dde) {
    this.dde = dde;
    this.markers = [];
    this.layer = dde.ui.submarkers;
  };

  var MarkerList = this.MarkerList.prototype = {};

  MarkerList.add = function (elem) {
    var klass = js.lsn.ext.dde.markers.InlineMarker;
    var attrs = null;
    this.markers.push(new klass(this.dde, elem, attrs));
  };

  MarkerList.clear = function () {
    js.dom.removeChildren(this.layer);
  };

});
