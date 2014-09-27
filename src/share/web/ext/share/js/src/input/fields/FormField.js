/** @namespace ext.share.input.fields */
js.extend('ext.share.input.fields', function (js) {

  var _package = this;
  var CNode = js.ext.share.input.FormNode;

  _package.FormField = function (data) {
    CNode.apply(this, [data]);
    this.isModified = null; // null indicates uninit, false is set in deserialize
    this.alStorageChange = null;
    this.alUserChange = null;
    this.alCreate = null;
    this.input = this.createInput();
    this.input.addActionListener('onChange', this.onInputChange, this);
    if (this.data.value) {
      this.input.deserialize(this.data.value);
    }
    this.uiDisplay = js.dom.createElement('SPAN');
    this.displayElements = [this.uiDisplay];
  };

  var _proto = _package.FormField.prototype = js.lang.createMethods(
    CNode
  );

  // This is the default field class
  js.ext.share.input.fields.factory.set('field', _package.FormField, true);

  _proto.getElements = function () {
    return this.input.getElements();
  };

  _proto.getDisplayElements = function () {
    this.updateDisplayValue();
    return this.displayElements;
  };

  _proto.updateDisplayValue = function () {
    var valueText = this.getValueText();
    var encodedValue = js.data.entities.encode(valueText, true);
    js.dom.setValue(this.uiDisplay, encodedValue);
    this.input.enable();
  };

  _proto.getValueText = function () {
    return this.input.getValueText();
  };

  _proto.getLabelText = function () {
    return js.util.firstDefined(this.data.label, this.data.name);
  };

  _proto.getDescriptionText = function () {
    return js.util.firstDefined(this.data.description, '');
  };

  _proto.getMenuElements = function () {
    return [];
  };

  _proto.hasChanged = function () {
    return this.isModified;
  };

  _proto.createInput = function () {
    return this.input || js.ext.share.input.factory.createObject(
      this.data.type, this.data.input
    );
  };

  _proto.isHidden = function () {
    return this.input.isHidden();
  };

  _proto.focus = function () {
    return this.input.focus();
  };

  _proto.select = function () {
    return this.input.select();
  };

  _proto.reset = function () {
    return this.input.reset();
  };

  // ScalarNode will emit onChange.
  //
  // All nodes emit onUpdate when their attributes are updated. (This is not
  // listened to here.)
  _proto.tieValue = function (parentValue, key, bAutoCommit) {
    var storedValue = parentValue.getValue(key);
    if (storedValue) {
      if (this.alStorageChange) this.alStorageChange.remove();
      this.alStorageChange =
        storedValue.addActionListener('onChange', this.onStorageChange, this);
      this.onStorageChange(null, storedValue);
    }
    if (bAutoCommit) {
      if (storedValue) {
        if (this.alUserChange) this.alUserChange.remove();
        this.alUserChange =
          this.input.addActionListener('onChange', this.onUserChange, this);
      } else {
        this.alCreate = this.input.addActionListener(
          'onChange', this.onUserCreate, this, [parentValue, key]
        );
      }
    }
  };

  _proto.untieValue = function () {
    if (this.alStorageChange)  {
      this.alStorageChange.remove();
      this.alStorageChange = null;
    }
    if (this.alUserChange)  {
      this.alUserChange.remove();
      this.alUserChange = null;
    }
    if (this.alCreate)  {
      this.alCreate.remove();
      this.alCreate = null;
    }
    this.dnode = null;
    this.deserialize('');
  };

  _proto.onStorageChange = function (action, dnode) {
    if (!dnode) {
      this.deserialize('');
    } else {
      this.dnode = dnode;
      this.deserialize(this.dnode.toString());
    }
  };

  _proto.onUserCreate = function (action, input, parentValue, key) {
    var value = this.serialize();
    var db = parentValue.getDataBridge();
    var addr = parentValue.getAddress() + '/' + key;
    db.store(addr, value, [this.onCreateValue, this]);
    this.input.disable();
  };

  _proto.onCreateValue = function (dnode) {
    if (dnode) {
      this.alCreate.remove();
      this.alCreate = null;
      var key = dnode.getKey();
      var parentValue = dnode.getParentNode();
      this.tieValue(parentValue, key, true);
      this.input.enable();
    }
  };

  _proto.onUserChange = function (action, input) {
    js.lang.assert(this.dnode);
    var value = this.serialize();
    var db = this.dnode.getDataBridge();
    var addr = this.dnode.getAddress();
    if (this.alStorageChange)  {
      this.alStorageChange.remove();
      this.alStorageChange = null;
    }
    db.store(addr, value, [this.onCommitValue, this]);
    this.input.disable();
  };

  _proto.onInputChange = function (action, input) {
    this.isModified = true;
  };

  _proto.onCommitValue = function (dnode) {
    if (!dnode) return; // leaves input in disabled state
    if (dnode !== this.dnode) return; // leaves input in disabled state
    this.isModified = false;
    this.updateDisplayValue();
    this.input.enable();
    this.alStorageChange =
      dnode.addActionListener('onChange', this.onStorageChange, this);
  };

  _proto.deserialize = function (storedValue) {
    var result = this.input.deserialize(storedValue);
    this.isModified = false;
    this.updateDisplayValue();
    return result;
  };

  _proto.serialize = function () {
    return this.input.serialize();
  };

});
