js.extend('lsn.ext.wireframe.data', function (js) {

  var CAction = js.action.ActionDispatcher;
  var CNode = js.data.Node;

  this.Node = function () {
    CAction.apply(this);
    CNode.apply(this, arguments);
  };

  var Node = this.Node.prototype = js.lang.createMethods(
    CAction,
    CNode
  );

  Node.type = 'AbstractNode';

  Node.onAdopt = function (node) {
    this.executeAction('onAdopt', node);
  };

  Node.onOrphan = function (node) {
    this.executeAction('onOrphan', node);
  };

  // The preceding node is the one which appears "above" this one in a 
  // sequential context, e.g., if you were to C<walk> the tree.
  Node.getPrecedingNode = function () {
    var n = undefined;
    if (this.previousSibling) {
      n = this.previousSibling;
      while (n.lastChild) {
        n = n.lastChild;
      }
    } else {
      n = this.parentNode;
    }
    return n;
  };

  Node.getSucceedingNode = function () {
    return this.firstChild || this.nextSibling || this.parentNode ? this.parentNode.nextSibling : undefined;
  };

  /**
   * @function toString
   * Create a terse informational string which identifies this object
   */

  Node.toString = js.lang.createAbstractFunction();

  /**
   * @function toObject
   * Create a JavaScript Object which persists this object's data.
   */

  Node.toObject = function () {
    var obj = {
      'id': this.id,
      'tagName': this.tagName,
      'data': this.data,
      'childNodes': []
    };
    for (var node = this.firstChild; node; node = node.nextSibling) {
      obj.childNodes.push(node.toObject());
    }
    return obj;
  };

  /**
   * @function serialize
   * Create a serialized string which represents this object
   */

  Node.serialize = function () {
    return js.data.xfr.format(this.toObject());
  };

  /**
   * @function deserialize
   * Instantiate object members from a serialized string
   */

  Node.deserialize = js.lang.createAbstractFunction();

  /**
   * @function canAdopt
   * Can the specified node be a child of this
   */

  Node.canAdopt = js.lang.createAbstractFunction();

});
