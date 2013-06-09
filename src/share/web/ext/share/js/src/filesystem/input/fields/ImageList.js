/** @namespace ext.share.input.fields */
js.extend('ext.share.input.fields', function (js) {

  var _package = this;
  var CFormField = js.ext.share.input.fields.FormField;

  _package.ImageList = function (data) {
    this.uiRoot = js.dom.createElement('DIV');
    this.uiMenu = js.dom.createElement('DIV');
    CFormField.apply(this, [data]);
  };

  var _proto = _package.ImageList.prototype = js.lang.createMethods(
    CFormField
  );

  js.ext.share.input.fields.factory.set('image-list', _package.ImageList);

  _proto.onAdopted = function () {
    if (!this.childNodes) {
      this.appendChildren(this.data.fields);
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
        'P.error=Missing storage (no code to vivify)'
      ));
      return;
    }

    var editor = new js.ext.share.filesystem.input.editors.ImageList();
    js.dom.replaceChildren(this.uiRoot, editor.getElements());
    js.dom.replaceChildren(this.uiMenu, editor.getMenuElements());
    editor.registerHandler('add-image', this.onBrowseImage, this);
    editor.registerHandler('delete-image', this.onDeleteImage, this);
    editor.load(storedValue);

    return this.input.setValue(storedValue);
  };

  _proto.onBrowseImage = function (action, target) {
    var selectDialog = env.dialogs.get('ext-share-dialog-filesystem-select');
    selectDialog.run({
      'schema': {
        'fields': [
          {
            'type': 'select-filesystem-entry',
            'name': 'dnode',
            'input': {
              'rootAddress': this.input.getParameter('rootAddress'),
              'showThumbnails': true
            }
          }
        ]
      }
    }, [this.onAddImage, this]);
  };

  _proto.onAddImage = function (action, values) {
    var selected = values.dnode;
    var imageAddress = selected.getAddress();
    var arrayNode = this.input.value;
    var addr = arrayNode.getAddress() + '/<next>';
    arrayNode.getDataBridge().store(addr, imageAddress);
  };

  _proto.onDeleteImage = function (action, target) {
    var addr = target.getDataNode().getAddress();
//  var message = 'Are you sure you want to remove this image from the list?';
    var message = 'Are you sure you want to remove: ' + addr;
    env.status.confirm(message, [function (result) {
      if (result) {
        var arrayNode = this.input.value;
        arrayNode.getDataBridge().remove(addr);
      }
    }, this]);
  };

});
