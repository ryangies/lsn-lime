/** @namespace ext.share */
js.extend('ext.share', function (js) {

  this.Initiator = function (props) {
    js.util.overlay(this, props);
  };

  var _proto = this.Initiator.prototype = js.lang.createMethods(
  );

  _proto.match = function (node) {
    var file = node.getDataNode();
    var matchTypes = this.matchTypes;
    var ok = matchTypes ? false : true;
    if (matchTypes) {
      var type = file.getType();
      for (var i = 0; !ok && i < matchTypes.length; i++) {
        ok = type.match(matchTypes[i]);
      }
    }
    return ok ? true : false;
  };

});
