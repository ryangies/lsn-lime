js.extend('lsn.ext.wireframe.app', function (js) {

  var CApp = js.lsn.ext.wireframe.app.Application;

  this.Editor = function () {
    CApp.apply(this);
    this.views = [];
    this.selected = this.root;
  };

  var _proto = this.Editor.prototype = js.lang.createMethods(
    CApp
  );

  _proto.addView = function (view) {
    this.views.push(view);
    view.addActionListener('onSelect', this.onSelect, this);
    view.addActionListener('onDeselect', this.onDeselect, this);
  };

  _proto.onSelect = function (action, node) {
    this.selected = node;
    this.executeAction('onSelectNode', node);
  };

  _proto.onDeselect = function (action, node) {
    this.selected = undefined;
    this.executeAction('onDeselectNode', node);
  };

  _proto.createNode = function (typeName) {
    return js.lsn.ext.wireframe.data.createInstance(typeName);
  };

  _proto.commands.createBefore = function (values) {
    if (!this.selected) throw 'No node selected';
    var parentNode = this.selected.parentNode;
    var newNode = this.createNode(values.typeName);
    if (parentNode) {
      parentNode.insertBefore(newNode, this.selected);
    } else {
      this.selected.appendChild(newNode);
    }
    this.executeAction('onCreateNode', newNode);
  };

  _proto.commands.createChild = function (values) {
    if (!this.selected) throw 'No node selected';
    var parentNode = this.selected;
    var newNode = this.createNode(values.typeName);
    parentNode.appendChild(newNode);
    this.executeAction('onCreateNode', newNode);
  };

  _proto.commands.createParent = function (values) {
    if (!this.selected) throw 'No node selected';
    var newNode = this.createNode(values.typeName);
    var parentNode = this.selected.parentNode;
    if (parentNode) {
      if (this.selected.previousSibling) {
        parentNode.insertAfter(newNode, this.selected.previousSibling);
      } else if (this.selected.nextSibling) {
        parentNode.insertBefore(newNode, this.selected.nextSibling);
      } else {
        parentNode.appendChild(newNode);
      }
      newNode.appendChild(this.selected);
    } else {
      this.selected.appendChild(newNode);
    }
    this.executeAction('onCreateNode', newNode);
  };

  _proto.commands.createAfter = function (values) {
    if (!this.selected) throw 'No node selected';
    var parentNode = this.selected.parentNode;
    var newNode = this.createNode(values.typeName);
    if (parentNode) {
      parentNode.insertAfter(newNode, this.selected);
    } else {
      this.selected.appendChild(newNode);
    }
    this.executeAction('onCreateNode', newNode);
  };

  _proto.commands.deleteCurrent = function () {
    if (!this.selected) throw 'No node selected';
    var node = this.selected;
    if (node && node.parentNode) {
      // The alternate node suggests the new selection as the current is being
      // deleted.
      var altNode = node.firstChild || node.nextSibling || node.previousSibling || node.parentNode;
      var childNode = node.firstChild;
      while (childNode) {
        node.parentNode.insertAfter(childNode, node);
        childNode = node.firstChild;
      }
      node.parentNode.removeChild(node);
      this.executeAction('onDeleteNode', node, altNode);
    }
  };

  _proto.commands.deleteRecursive = function () {
    if (!this.selected) throw 'No node selected';
    var node = this.selected;
    if (node && node.parentNode) {
      // The alternate node suggests the new selection as the current is being
      // deleted.
      var altNode = node.nextSibling || node.previousSibling || node.parentNode;
      node.parentNode.removeChild(node);
      this.executeAction('onDeleteNode', node, altNode);
    }
  };

});
