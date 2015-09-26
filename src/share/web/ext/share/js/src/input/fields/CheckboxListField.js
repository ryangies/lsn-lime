/** @namespace ext.share.input.fields */
js.extend('ext.share.input.fields', function (js) {

  var _package = this;
  var CFormField = js.ext.share.input.fields.FormField;

  _package.CheckboxListField = function (data) {
    this.uiRoot = js.dom.createElement('DIV');
    this.uiMenu = js.dom.createElement('DIV');
    CFormField.apply(this, [data]);
  };

  var _proto = _package.CheckboxListField.prototype = js.lang.createMethods(
    CFormField
  );

  js.ext.share.input.fields.factory.set('checkbox-list', _package.CheckboxListField);

  _proto.onAdopted = function () {
    if (!this.childNodes) {
      this.appendChildren(this.data.options);
    }
  };

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.isHidden = function () {
    return false;
  };

  _proto.focus = function () {
  };

  _proto.select = function () {
  };

  _proto.getMenuElements = function () {
    return [this.uiMenu];
  };

  _proto.tieValue = function (dnode, key, bAutoCommit) {
    // bAutoCommit is implicitly true
    var storedValue = dnode.getValue(key);
    if (!storedValue) {
      js.dom.replaceChildren(this.uiRoot, js.dom.createElements(
        'P.error=Missing storage'
      ));
      return;
      /** Need to store/callback then proceed to vifify
       *
      storedValue = new js.hubb.ArrayNode();
      storedValue.setAttribute('addr', dnode.getAddress() + '/' + key);
      storedValue.setAttribute('type', 'data-array');
      storedValue.setAttribute('mtime', 0);
      dnode.setValue(key, storedValue);
      */
    }
    var id = dnode.getAddress();
    js.dom.replaceChildren(this.uiRoot, js.dom.createElements(
      'P.error=' + id
    ));
    var selection = new js.ext.share.Selection();
    //selection.select(this.editor);
    return this.input.setValue(storedValue);
  };

});
