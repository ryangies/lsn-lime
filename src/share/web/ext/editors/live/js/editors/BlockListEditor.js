js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var _proto = js.lang.createMethods(CEditor);

  this.BlockListEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.dlg = null;
  };

  this.BlockListEditor.prototype = _proto;

  _proto.resize = function () {
    this.dde.refreshMasks();
  };

  _proto.begin = function () {
    this.dde.refreshMasks();
    this.dde.mm.show('none');
    this.show();
  };

  _proto.getDialog = function () {
    if (!this.dlg) {
      this.dlg = env.dialogs.get('ext-editors-live-select-key');
      this.dlg.addActionListener('onDialogHide', function (action) {
        this.dde.deselect();
      }, this);
    }
    return this.dlg;
  };

  _proto.show = function () {

    var cluster = this.marker.cluster;
    var group = cluster.parentNode;
    var attrs = group.data.begin.attrs;
    var ds = group.data.begin.attrs.ds;

    var context = {
      'addr': attrs['from'],
      'ds': ds
    };

    function onSubmit (action, values, context) {

      var ok = this.dde.deltas.isUpToDate()
        ? true
        : confirm('This will require saving your current changes, continue?');

      if (!ok) return;

      var indexes = [];
      var list = context.assignedItems;
      for (var opt = list.firstChild; opt; opt = opt.nextSibling) {
        indexes.push(opt.value);
      }

      this.dde.deltas.addDelta('store', ds, indexes);
      this.dde.exec('docSave', true);

    }

    this.getDialog().run(context, [onSubmit, this, [context]]);

  };

});
