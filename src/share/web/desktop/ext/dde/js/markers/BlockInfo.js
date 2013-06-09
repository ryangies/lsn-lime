ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  this.BlockInfo = function () {
    ecma.data.Node.apply(this, [new Object()]);
    this.data.begin = null;
    this.data.end = null;
  };

  this.BlockInfo.prototype = ecma.lang.createMethods(ecma.data.Node);

  ecma.util.overlay(this.BlockInfo.prototype, {

    setBegin: function (cnode, cdata) {
      var attrs = ecma.lsn.ext.dde.parseAttributes(cdata);
      this.data.begin = {'cnode':cnode, 'attrs':attrs.toObject()};
    },

    addItem: function (cnode, cdata) {
      var attrs = ecma.lsn.ext.dde.parseAttributes(cdata);
      var node = this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
      this.captureElements(node.previousSibling, cnode);
    },

    setEnd: function (cnode, cdata) {
      var attrs = ecma.lsn.ext.dde.parseAttributes(cdata);
      this.data.end = {'cnode':cnode, 'attrs':attrs.toObject()};
      if (!this.lastChild) {
        // There are no items in this for block.
        this.appendChild({'cnode':cnode, 'attrs':attrs.toObject()});
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
      ecma.dom.removeElement(node.data.cnode);
    }

  });

});
