js.extend('lsn.ext.dde', function (js) {

  this.BlockInfo = function () {
    js.data.Node.apply(this, [new Object()]);
    this.data.begin = null;
    this.data.end = null;
  };

  this.BlockInfo.prototype = js.lang.createMethods(js.data.Node);

  js.util.overlay(this.BlockInfo.prototype, {

    setBegin: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      this.data.begin = {'cnode':cnode, 'attrs':attrs.toObject()};
    },

    addItem: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      var node = this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
      this.captureElements(node.previousSibling, cnode);
    },

    setEnd: function (cnode, cdata) {
      var attrs = js.lsn.ext.dde.parseAttributes(cdata);
      this.data.end = {'cnode':cnode, 'attrs':attrs.toObject()};
      if (!this.lastChild) {
        // There are no items in this for block.
        this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
      } else if (this.data.begin.attrs['from']) {
        var node = this.firstChild;
        this.firstChild.removeAllChildren();

        var elem = this.data.begin.cnode.nextSibling;
        while (elem && elem !== cnode) {
          node.appendChild(elem);
          elem = elem.nextSibling;
        }
        js.dom.removeElement(cnode);

        this.removeAllChildren();
        this.appendChild(node);
      } else {
        this.captureElements(this.lastChild, cnode);
      }
    },

    captureElements: function (node, endElem) {
      if (!node) return;
      var elem = node.data.cnode.nextSibling;
      while (elem && elem !== endElem) {
        node.appendChild(elem);
        elem = elem.nextSibling;
      }
      js.dom.removeElement(node.data.cnode);
    }

  });

});
