/** @namespace ext.share.filesystem.input */
js.extend('ext.share.filesystem.input', function (js) {

  var _package = this;
  var CInputBase = js.ext.share.input.InputBase;

  var _proto = js.lang.createMethods(CInputBase);

  _package.Image = function (params, elem) {
    CInputBase.apply(this, [params, elem]);
    this.value = this.emptyValue = new String();
  };

  _package.Image.prototype = _proto;

  js.ext.share.input.factory.set('select-filesystem-image', _package.Image);

  _proto.createElements = function () {
    this.uiImage = js.dom.createElement('IMG.image-thumb', {
      'onClick': [this.onClickImage, this]
    });
    this.uiRoot = js.dom.createElement('DIV', [
      this.uiImage,
      'BUTTON=Browse', {
        'onClick': [this.onClickBrowse, this]
      }
    ]);
    return [this.uiRoot];
  };

  _proto.read = function () {
    return this;
  };

  _proto.write = function () {
    var src = this.value && (this.value.length > 0)
      ? this.value
      : '/res/icons/16x16/status/image-missing.png';
    var url = new js.http.Location(src);
    url.addParameter('resize', 'x50');
    js.dom.setAttribute(this.uiImage, 'src', url.getHref());
    return this;
  };

  _proto.unmarshal = function () {
    return this.value;
  };

  _proto.marshal = function () {
    return this.value;
  };

  _proto.deserialize = function (storedValue) {
    return this.setValue(storedValue || this.emptyValue);
  };

  _proto.serialize = function () {
    return this.getValue();
  };


  _proto.onClickBrowse = function (event) {
    var selectDialog = env.dialogs.get('ext-share-dialog-filesystem-select');
    selectDialog.run({
      'value': this.value,
      'schema': {
        'fields': [
          {
            'type': 'select-filesystem-entry',
            'name': 'dnode',
            'input': {
              'rootAddress': this.getParameter('rootAddress'),
              'showThumbnails': true
            }
          }
        ]
      }
    }, [this.onSelectImage, this]);
  };

  _proto.onSelectImage = function (action, values) {
    var selected = values.dnode;
    this.setValue(selected.getAddress());
    this.executeClassAction('onChange', this);
  };

  _proto.onClickImage = function (event) {
  };

});
