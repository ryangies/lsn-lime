[#:http:header 'Cache-Control' 'no-store']
js.extend('desktop.ext.edit.data', function (js) {

  var _css = null;

  function _initStyles () {
    if (_css) return;
    _css = js.dom.include.style({'href': '[#`./layout.css`]'});
  };

  this.Main = function () {
    this.node = undefined;
    this.uiRoot = this.createUI();
  }

  var _proto = this.Main.prototype = js.lang.createMethods();

  _proto.reset = function () {
    this.node = undefined;
    js.dom.removeChildren(this.uiRoot);
  };

  _proto.load = function (node) {
    this.node = node;
    this.populate(node, this.getUI());
  };

  _proto.getUI = function () {
    return this.uiRoot;
  };

  _proto.createUI = function () {
    return js.dom.createElement('div.lde');
  };

  _proto.populate = function (node, ce) {
    _initStyles();
    if (node.isDataContainer()) {
      var w1 = js.dom.getWidth(this.getUI());
      var lbls = [];
      var ctrls = [];
      node.iterate(function (k, v) {
        var wrap = this.createWrap(k, v);
        ce.appendChild(wrap);
        var lbl = undefined;
        if (node.getType() != 'data-array') {
          lbl = this.createLabel(k, v);
          wrap.appendChild(lbl);
        }
        if (v.getType() == 'data-hash' || v.getType() == 'data-array') {
          if (lbl) wrap.appendChild(js.dom.createElement('br',{'class':'clear'}));
          this.populate(v, wrap);
        } else {
          if (lbl) lbls.push(lbl);
          var ctrl = this.createControl(k, v);
          wrap.appendChild(ctrl);
          ctrls.push(ctrl);
        }
      }, this);
      // fixed-width labels
      var width = 0;
      for (var i = 0; i < lbls.length; i++) {
        width = Math.max(width, js.dom.getWidth(lbls[i].firstChild));
      }
      for (var i = 0; i < lbls.length; i++) {
        js.dom.setStyle(lbls[i], 'width', width +'px');
      }
      // fixed-width (input|textarea) controls
      for (var i = 0; i < ctrls.length; i++) {
        var psib = ctrls[i].previousSibling;
        var rt = js.dom.getRight(psib);
        var width = w1 - 30 - rt - 16;

        var elems = js.dom.getElementsByClassName(ctrls[i], 'wide');
        for (var j = 0, elem; elem = elems[j]; j++) {
          js.dom.setStyle(elem, 'width', width + 'px');
        }

        if (js.dom.getStyle(psib, 'float') == 'left') {
          var ml = js.dom.getWidth(psib);
          ml += js.util.asInt(js.dom.getStyle(psib, 'margin-right'));
          js.dom.setStyle(ctrls[i], 'margin-left', ml + 'px');
        }
      }
    } else {
      ce.appendChild(this.createControl(node.getAddress(), node));
    }
  };

  _proto.createWrap = function (key, node) {
    var parts = node.getType().split('-');
    var dtype = parts.length > 2 ? parts.pop() : undefined;
    var type = parts[0] + '-' + parts[1];
    return js.dom.createElement('div', {'class':'wrap'}, [
      'img', {'class':'beg', src: '/res/icons/16x16/nodes/mpe-' + type + '.png'},
      'img', {'class':'end', src: '/res/icons/16x16/nodes/mpe-end.png'}
    ]);
  };

  _proto.createLabel = function (key, node) {
    return js.dom.createElement('div', {'class':'lbl'},
      ['span', {innerHTML: key}]);
  };

  _proto.createControl = function (key, node) {
    var parts = node.getType().split('-');
    var dtype = parts.length > 2 ? parts.pop() : undefined;
    var type = parts[0] + '-' + parts[1];
    var ctrl = js.dom.createElement('div', {'class':'ctrl'});
    var klass = dtype == 'txt'  ? js.desktop.ext.edit.data.InputTextarea :
                dtype == 'html' ? js.desktop.ext.edit.data.InputTextarea :
                                  js.desktop.ext.edit.data.InputText;
    var input = new klass(node);
    js.dom.appendChildren(ctrl, input.getUI());
    return ctrl;
  };

});
