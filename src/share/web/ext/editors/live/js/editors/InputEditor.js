js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;
  var _proto = js.lang.createMethods(CEditor);

  this.InputEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.dlg = null;
  };

  this.InputEditor.prototype = _proto;

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
      this.dlg = env.dialogs.get('ext-editors-live-input');
      this.dlg.addActionListener('onDialogHide', function (action) {
        this.dde.deselect();
      }, this);
    }
    return this.dlg;
  };

  _proto.show = function () {
    var context = {
      'marker': this.marker
    };
    function onSubmit (action, formValues, context) {
      var ds = context.marker.getAttribute('innerHTML');
      if (!ds) throw new Error('Expecting innerHTML data-soruce');
      var value = context.input.serialize();
      this.dde.js.dom.setValue(context.marker.elem, value);
      this.dde.deltas.addDelta('store', ds, value);
    }
    this.getDialog().run(context, [onSubmit, this, [context]]);
  };

});
