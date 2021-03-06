ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  //var _attrProps = [#:js:var ./attributes.hf];

  var CEditor = ecma.lsn.ext.dde.Editor;

  this.AttributeEditor = function (dde, marker) {
    CEditor.apply(this, arguments);
    this.modified = false;
    this.dde.mm.show('none');
    this.opts = this.initOptions();
    this.ctrls = this.initControls();
  };

  var AttributeEditor =
    this.AttributeEditor.prototype =
      ecma.lang.createMethods(CEditor);

  AttributeEditor.initOptions = function () {
    var optStr = this.dde.js.dom.getAttribute(this.target, '_lsn_opts');
    return ecma.lsn.ext.dde.parseAttributes(optStr);
  };

  AttributeEditor.initControls = function () {
    var result = [];
    // Create a control for each attribute defined by the marker
    var attrs = this.marker.getAttributes();
    attrs.iterate(function (attr, ds) {
      result.push(new ecma.lsn.ext.dde.AttributeControl(attr, ds));
    }, this);
    return result;
  };

  AttributeEditor.getControl = function (attr) {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      if (ctrl.attr === attr) return ctrl;
    }
  };

  AttributeEditor.resize = function () {
    this.dde.refreshMasks();
  };

  AttributeEditor.begin = function () {
    this.dde.refreshMasks();
    if (!this.dlg) {
      this.dlg = new ecma.lsn.Dialog("[#:html:url './dlg-edit-attr.html']", {
        modal:true, modalOpacity:0, refetch:false
      });
      this.dlg.addEvent('show', ecma.lang.Callback(this.onShow, this));
      this.dlg.addEvent('ready', ecma.lang.Callback(this.onReady, this));
      this.dlg.addEvent('ok', ecma.lang.Callback(this.onOk, this));
      this.dlg.addEvent('apply', ecma.lang.Callback(this.onApply, this));
      this.dlg.addEvent('cancel', ecma.lang.Callback(this.onCancel, this));
    }
    this.dlg.show();
  };

  AttributeEditor.end = function () {
    this.dlg.hide();
    if (this.modified) {
      var data = {};
      var resize = null;
      for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
        if (ctrl.attr == 'resize') {
          resize = this.getAttribute(ctrl.attr);
          continue;
        }
        data[ctrl.attr] = this.getAttribute(ctrl.attr);
      }
      if (resize) {
        data['src'] += '?resize=' + resize;
      }
      this.recordChanges(data);
    }
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.destroy();
    }
  };

  AttributeEditor.recordChanges = function (data) {
    var elem = this.elem;
    var attrs = this.marker.getAttributes();
    var names = attrs.keys();
    for (var j = 0, name; name = names[j]; j++) {
      var ds = attrs.get(name);
      var raw = data[name];
      var val = ecma.data.entities.decode(raw);
      var re = new RegExp('\\[' + '#', 'g');
      val = val.replace(re, '[&#35;'); // livesite formatting
      this.dde.deltas.addDelta('store', ds, val);
    }
  };

  AttributeEditor.canRemove = function () {
    return false;
  };

  AttributeEditor.focus = function () {
    var ctrl = this.ctrls[0];
    if (ctrl) {
      ctrl.input.focus();
    }
  };

  AttributeEditor.getValue = function (attr) {
    var ctrl = this.getControl(attr);
    return ctrl ? ctrl.getValue() : undefined;
  };

  AttributeEditor.onShow = function () {
    ecma.dom.removeChildren(this.dlg.params.container);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var elem = ctrl.getRootElement();
      ctrl.setOriginalValue(this.getAttribute(ctrl.attr));
      if (!ctrl.hidden) {
        ecma.dom.addEventListener(
          ctrl.input, 'focus', this.showHelp, this, [ctrl]
        );
        ecma.dom.appendChild(this.dlg.params.container, elem);
      }
    }
    if (this.canRemove()) {
      var btnApply = this.dlg.getElementById('btn_apply');
      ecma.dom.insertBefore(ecma.dom.createElement(
        'button=Delete', {
          'onClick': [this.onRemove, this],
          'id': 'btn_remove'
        }
      ), btnApply);
    }
  };

  AttributeEditor.showHelp = function (event, ctrl) {
    ecma.dom.setValue(this.helpArea, ctrl.getHelp());
  };

  AttributeEditor.clearHelp = function (event, ctrl) {
    ecma.dom.setValue(this.helpArea, '');
  };

  AttributeEditor.onReady = function () {
    if (!this.helpArea) {
      this.helpArea = ecma.dom.createElement('div', {'class':'help'});
      var pe = this.dlg.getElementById('btnbar');
      ecma.dom.insertAfter(this.helpArea, pe);
    }
    this.focus();
  };

  AttributeEditor.onApply = function () {
    var isResized = false;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      var attr = ctrl.attr;
      var value = ctrl.getValue();
      this.setAttribute(attr, value);
      if (attr == 'resize' && value) isResized = true;
    }
    if (!isResized) {
      this.dde.js.dom.removeAttribute(this.target, 'width');
      this.dde.js.dom.removeAttribute(this.target, 'height');
    }
    this.dde.refreshMasks();
  };

  AttributeEditor.setAttribute = function (attr, value) {
    if (this.target.tagName == 'A') {
      // When updating anchors where the text is the same as the link, we
      // will update the text when the link changes.
      if (attr == 'href') {
        var href = this.dde.js.dom.getAttribute(this.target, 'href');
        if (this.target.innerHTML == href) {
          this.target.innerHTML = value;
        }
      }
    }
    this.dde.js.dom.setAttribute(this.target, attr, value);
  };

  AttributeEditor.getAttribute = function (attr) {
    return this.dde.js.dom.getAttribute(this.target, attr);
  };

  AttributeEditor.onOk = function () {
    this.onApply();
    this.modified = true;
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      ctrl.reset();
    }
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

  AttributeEditor.onCancel = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      this.setAttribute(ctrl.attr, ctrl.orig);
    }
    this.modified = false;
    if (this.dde.getEditor() === this) this.dde.deselect();
  };

});
