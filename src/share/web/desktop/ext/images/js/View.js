js.extend('ext.images', function (js) {

  this.View = function () {
    this.items = [];
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    return this.uiRoot = js.dom.createElement('DIV.results');
  };

  _proto.clear = function () {
    this.items = [];
    var root = this.getRootElement();
    js.dom.removeChildren(root);
  };

  _proto.updateUI = function (data) {
    var part = data.toObject();
    if (part.type == 'result') {
      this.updateResults(part);
    } else if (part.type == 'error') {
      alert(part.message);
    } else {
      throw 'Unknown response data';
    }
  }

  _proto.updateResults = function (part) {
    var src = new js.http.Location(part.addr);
    if (part.resize) {
      src.addParameter('resize', part.resize);
    }
    var root = this.getRootElement();
    var item = js.dom.createElement('DIV.item', [
      'IMG', {
        'src': src.getHref(),
        'width': part.resize_dims[0],
        'height': part.resize_dims[1]
      }, 
      'PRE', [
        '#text', {
          'nodeValue': [
            'url(' + part.addr + ');',
            'width:' + part.actual_dims[0] + 'px;' + 'height:' + part.actual_dims[1] + 'px;' + ' /* Actual */',
            'width:' + part.resize_dims[0] + 'px;' + 'height:' + part.resize_dims[1] + 'px;' + ' /* Resized */'
          ].join("\n")
        }
      ]
    ]);
    if (!this.items[part.addr]) {
      root.appendChild(item);
    } else {
      var old = this.items[part.addr];
      js.dom.insertBefore(item, old);
      js.dom.removeElement(old);
    }
    this.items[part.addr] = item;
  };

});
