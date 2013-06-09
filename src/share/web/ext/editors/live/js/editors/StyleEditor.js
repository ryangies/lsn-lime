js.extend('lsn.ext.dde', function (js) {

  var CEditor = js.lsn.ext.dde.Editor;

  this.StyleEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.modified = false;
    this.dde.mm.show('none');
    this.opts = this.initOptions();
    this.ctrls = this.initControls();
  };

  var StyleEditor =
    this.StyleEditor.prototype =
      js.lang.createMethods(CEditor);

  StyleEditor.initOptions = function () {
    var optStr = this.dde.js.dom.getAttribute(this.target, '_lsn_opts');
    return js.lsn.ext.dde.parseAttributes(optStr);
  };

  StyleEditor.initControls = function () {
    var result = [];
    // Create a control for each attribute defined by the marker
    var attrs = this.marker.getAttributes();
    attrs.iterate(function (attr, ds) {
      result.push(new js.lsn.ext.dde.StyleControl(attr, ds));
    }, this);
    return result;
  };

  StyleEditor.getControl = function (attr) {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      if (ctrl.attr === attr) return ctrl;
    }
  };

  StyleEditor.resize = function () {
    this.dde.refreshMasks();
  };

  StyleEditor.begin = function () {
    this.dde.refreshMasks();
    if (!this.dlg) {
      this.dlg = new js.lsn.Dialog("[#:html:url './dlg-edit-style.html']", {
        modal:true, modalOpacity:0, refetch:false
      });
      this.dlg.addEvent('show', js.lang.Callback(this.onShow, this));
      this.dlg.addEvent('ready', js.lang.Callback(this.onReady, this));
      this.dlg.addEvent('ok', js.lang.Callback(this.onOk, this));
      this.dlg.addEvent('apply', js.lang.Callback(this.onApply, this));
      this.dlg.addEvent('cancel', js.lang.Callback(this.onCancel, this));
    }
    this.dlg.show();
  };

  StyleEditor.end = function () {
    this.dlg.hide();
    if (this.modified) {
      var data = {};
      for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
        data[ctrl.attr] = ctrl.getValue();
      }
      this.recordChanges(data);
    }
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.destroy();
    }
  };

  StyleEditor.recordChanges = function (data) {
    var elem = this.elem;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = data[name];
      var val = js.data.entities.decode(raw);
      var re = new RegExp('\\[' + '#', 'g');
      val = val.replace(re, '[&#35;'); // livesite formatting
      this.dde.deltas.addDelta('store', ds, val);
    }
  };

  StyleEditor.canRemove = function () {
    return false;
  };

  StyleEditor.focus = function () {
    var ctrl = this.ctrls[0];
    if (ctrl) {
      ctrl.input.focus();
    }
  };

  StyleEditor.getValue = function (attr) {
    var ctrl = this.getControl(attr);
    return ctrl ? ctrl.getValue() : undefined;
  };

  StyleEditor.onShow = function () {
    js.dom.removeChildren(this.dlg.params.container);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var elem = ctrl.getRootElement();
      ctrl.setOriginalValue(this.getStyle(ctrl.attr));
      if (!ctrl.hidden) {
        js.dom.addEventListener(
          ctrl.input, 'focus', this.showHelp, this, [ctrl]
        );
        js.dom.appendChild(this.dlg.params.container, elem);
      }
    }
    if (this.canRemove()) {
      var btnApply = this.dlg.getElementById('btn_apply');
      js.dom.insertBefore(js.dom.createElement(
        'button=Delete', {
          'onClick': [this.onRemove, this],
          'id': 'btn_remove'
        }
      ), btnApply);
    }
  };

  StyleEditor.showHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, ctrl.getHelp());
  };

  StyleEditor.clearHelp = function (event, ctrl) {
    js.dom.setValue(this.helpArea, '');
  };

  StyleEditor.onReady = function () {
    if (!this.helpArea) {
      this.helpArea = js.dom.createElement('div', {'class':'help'});
      var pe = this.dlg.getElementById('btnbar');
      js.dom.insertAfter(this.helpArea, pe);
    }
    this.focus();
  };

  StyleEditor.onApply = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setStyle(ctrl.attr, ctrl.getValue());
    }
    this.dde.refreshMasks();
  };

  StyleEditor.getStyle = function (name) {
    var ccn = js.util.asCamelCaseName(name);
    return this.target.style[ccn];
  };

  StyleEditor.setStyle = function (name, value) {
    var ccn = js.util.asCamelCaseName(name);
    return this.target.style[ccn] = value;
  };

  StyleEditor.onOk = function () {
    this.onApply();
    this.modified = true;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.reset();
    }
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

  StyleEditor.onCancel = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setStyle(ctrl.attr, ctrl.orig);
    }
    this.modified = false;
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

});
