ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var _insert = function (bBefore) {
    var ok = this.dde.deltas.isUpToDate()
      ? true
      : confirm('This will require saving your current changes, continue?');
    if (!ok) return;
    this.dde.deselect();
    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var src = group.data.begin.attrs['new'];
    var index = ecma.util.asInt(cluster.index);
    if (!bBefore) index++;
    /*
    if (!this.dde.deltas.isUpToDate()) {
      // Items may have been re-orderd before this insert.  Update the order-
      // value by inserting a stub node and recording changes.
      var stub = {'attrs':{'key':index}};
      if (bBefore) {
        group.insertBefore(stub, cluster);
      } else {
        group.insertAfter(stub, cluster);
      }
      this.marker.recordChanges();
    }
    */
    var ds = group.data.begin.attrs.ds;
    this.dde.deltas.addDelta('insert', ds, index, src);
    this.dde.exec('docSave', true);
  };

  var CEditor = ecma.lsn.ext.dde.Editor;
  var BlockEditor = ecma.lang.createMethods(CEditor);

  this.BlockEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
  };

  this.BlockEditor.prototype = BlockEditor;

  BlockEditor.resize = function () {
    this.dde.refreshMasks();
  };

  BlockEditor.begin = function () {
    this.dde.refreshMasks();
    this.dde.mm.show('block');
  };

  BlockEditor.end = function () {
    /*
    var oldIndex = this.marker.cluster.data.attrs.key;
    var newIndex = this.marker.cluster.index;
    ///ecma.console.log('marker-end, oldIndex is', oldIndex);
    ///ecma.console.log('marker-end, newIndex is', newIndex);
    if (oldIndex === undefined) return;
    if (newIndex != oldIndex) {
      this.marker.recordChanges();
    }
    */
  };

  BlockEditor.focus = function () {
  };

  BlockEditor.exec = function (cmd, args) {
    var func = this[cmd];
    if (!ecma.util.isa(func, Function)) throw 'No such command: ' + cmd;
    func.apply(this, args);
  };

  BlockEditor.moveUp = function () {
    var cluster = this.marker.cluster;
    var prev = cluster.previousSibling;
    if (!prev) return;
    var refElem = prev.firstChild.data;
    var node = cluster.firstChild;
    while (node) {
      refElem.parentNode.insertBefore(node.data, refElem);
      node = node.nextSibling;
    }
    cluster.parentNode.insertBefore(cluster, prev);
    this.dde.refreshMasks();
    this.dde.scrollToMarker();
    this.recordChanges();
  };

  BlockEditor.moveDown = function () {
    var cluster = this.marker.cluster;
    var next = cluster.nextSibling;
    if (!next) return;
    var refElem = next.lastChild.data;
    var node = cluster.lastChild;
    while (node) {
      this.dde.js.dom.insertAfter(node.data, refElem);
      node = node.previousSibling;
    }
    cluster.parentNode.insertAfter(cluster, next);
    this.dde.refreshMasks();
    this.dde.scrollToMarker();
    this.recordChanges();
  };

  BlockEditor.recordChanges = function (group) {
    if (!group) group = this.marker.cluster.parentNode;
    var ds = group.data.begin.attrs.ds;
    var indexes = [];
    var node = group.firstChild;
    while (node) {
      indexes.push(node.data.attrs.key);
      node = node.nextSibling;
    }
    this.dde.deltas.addDelta('reorder', ds, indexes);
  };

  BlockEditor.insertBefore = function () {
    _insert.call(this, true);
  };

  BlockEditor.insertAfter = function () {
    _insert.call(this, false);
  };

  BlockEditor.remove = function () {
    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var key = cluster.data.attrs.key;
//  var key = cluster.index;
    cluster.data.attrs.key = undefined;
    var addr = group.data.begin.attrs.ds;
    if ((!addr) || (!key && key !== 0)) {
      throw 'Cannot determine data address';
    }
    if (!confirm('Remove the select block?')) return;
    addr += '/' + key;
    this.dde.deltas.addDelta('remove', addr);
    this.dde.deselect();
    var node = cluster.firstChild;
    while (node) {
      this.dde.removeMarkersFrom(node.data);
      node.data.parentNode.removeChild(node.data);
      node.data = null;
      node = node.nextSibling;
    }
    group.removeChild(cluster);
    this.recordChanges(group); // need to update any reording that happened before the delete
    this.dde.removeMarker(this.marker);
    this.dde.refreshMarkers();
  };

});
