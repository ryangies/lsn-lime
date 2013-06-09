js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var BlockEditor = js.lang.createMethods(CEditor);

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
  };

  BlockEditor.focus = function () {
  };

  BlockEditor.exec = function (cmd, args) {
    var func = this[cmd];
    if (!js.util.isa(func, Function)) throw 'No such command: ' + cmd;
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
    this.insert(true);
  };

  BlockEditor.insertAfter = function () {
    this.insert(false);
  };

  BlockEditor.insert = function (bBefore) {

    var ok = this.dde.deltas.isUpToDate()
      ? true
      : confirm('This will require saving your current changes, continue?');
    if (!ok) return;

    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var attrs = group.data.begin.attrs;
    var ds = group.data.begin.attrs.ds;
    var index = null;
    var dnode = env.hub.get(ds, [function (dnode) {

      if (!dnode) return;

      if (dnode.isDataArray()) {
        if (dnode.length) {
          index = js.util.asInt(cluster.index);
          if (!bBefore) index++;
        } else {
          index = 0;
        }
      } else if (dnode.isDataHash()) {
        var uuid = js.util.createUUID();
        index = uuid.split('-')[0];
      }

      if (attrs['new']) {

        this.createBlock(dnode, index, attrs['new']);

      } else if (attrs['of']) {

        // This block one 'of' a variety. It gets initialized from a skeleton.

        function onSubmit (action, values, dnode, index) {
          var srcAddr = values.skeleton;
          this.createBlock(dnode, index, srcAddr);
        }

        env.dialogs.get('ext-editors-live-select-skeleton').run(
          {'addr': attrs['of']},
          [onSubmit, this, [dnode, index]]
        );

      } else if (attrs['from']) {

        // See this marker's getEditor function
        js.lang.assert(false, 'Marker should have used BlockListEditor');

      } else {

        alert('We cannot determine how a new item should be created');

      }

    }, this]);

  };

  BlockEditor.createBlock = function (dnode, index, srcAddress) {
    var ds = dnode.getAddress();
    if (dnode.isDataHash()) {
      var destAddr = ds + '/' + index;
      this.dde.deltas.addDelta('copy', srcAddress, destAddr);
    } else {
      this.dde.deltas.addDelta('insert', ds, index, srcAddress);
    }
    this.dde.deselect();
    this.dde.exec('docSave', true);
  };

  BlockEditor.remove = function () {
    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var key = cluster.data.attrs.key;
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
