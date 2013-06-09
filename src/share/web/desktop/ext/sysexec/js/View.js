js.extend('local', function (js) {

  this.View = function () {
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    return this.uiRoot = js.dom.createElement('DIV.results');
  };

  _proto.clear = function () {
    var root = this.getRootElement();
    js.dom.removeChildren(root);
  };

  _proto.updateUI = function (data) {
    var part = typeof(data) == 'string'
      ? ['result', data]
      : data.getObject();
    var line = js.dom.createElement('DIV', [
      'PRE.' + part[0], [
        '#text', {
          'nodeValue': part[1]
        }
      ]
    ]);
    js.dom.appendChild(this.getRootElement(), line);
  }

});
