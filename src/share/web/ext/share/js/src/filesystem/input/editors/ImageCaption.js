/** @namespace ext.share.filesystem.input.editors */
js.extend('ext.share.filesystem.input.editors', function (js) {

  var _package = this;
  var _defaultCss = null;

  function _initDefaultStyles () {
    if (_defaultCss) return;
    _defaultCss = new js.dom.StyleSheet({'position':'first'});
    _defaultCss.createRulesFromData({#:json default-styles});
  }

  _package.ImageCaption = function () {
    _initDefaultStyles();
    this.hub = js.hubb.getInstance();
    this.imageUrl = null;
    this.listeners = [];
    this.createElements();
  };

  var _proto = _package.ImageCaption.prototype = js.lang.createPrototype();

  _proto.createElements = function () {
    this.statusIcon = new js.lsn.ui.StatusIcon();
    this.uiCaption = js.dom.createElement('INPUT.image-caption');
    this.uiSave = js.dom.createElement('BUTTON=Save', {
      'onClick': [this.onSaveClick, this]
    });
    this.uiRoot = js.dom.createElement('DIV.image-caption', [
      'LABEL=Caption: ', this.uiCaption, this.uiSave,
      this.statusIcon.getRootElement()
    ]);
  };

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.setSelector = function (mnode) {
    this.clearListeners();
    this.listeners.push(
      mnode.rootNode.addActionListener('select', [this.onSelect, this]),
      mnode.rootNode.addActionListener('deselect', [this.onDeselect, this])
    );
  };

  _proto.clearListeners = function () {
    while (this.listeners.length) {
      listener = this.listeners.pop();
      listener.remove();
    }
  };

  _proto.onSelect = function (action, mnode) {
    js.console.log("Selected: ", mnode);
    this.imageUrl = mnode.getDataNode().getValue();
    this.hub.fetch(this.imageUrl, [this.onImageFetch, this]);
  };

  _proto.onDeselect = function (action, mnode) {
    js.console.log("Deselected: ", mnode);
    this.deactivate();
  };

  _proto.activate = function (dnode) {
    this.target = this.getCaptionNode(dnode);
    this.statusIcon.showReady();
    js.dom.toggleClassName(this.uiRoot, 'active', true);
    this.targetChangeListener = this.target.tie(this.uiCaption, ['value']);
  };

  _proto.deactivate = function () {
    this.target = null;
    this.targetChangeListener.remove();
//  js.dom.setValue(this.uiCaption, '');
    js.dom.toggleClassName(this.uiRoot, 'active', false);
  };

  _proto.onSaveClick = function (event) {
    if (this.target) {
      this.statusIcon.showActive();
      this.hub.store(
        this.target.getAddress(),
        js.dom.getValue(this.uiCaption),
        [function (dnode) {
          if (dnode) {
            this.statusIcon.showComplete();
          } else {
            this.statusIcon.showError();
          }
        }, this]
      );
    }
  };

  _proto.onImageFetch = function (dnode) {
    var addr = dnode.getAddress();
    if (this.imageUrl == addr) {
      this.activate(dnode);
    };
  };

  _proto.getCaptionNode = function (dnode) {
    var possibleKeys = [
      'Description',
      'ImageDescription',
      'Caption-Abstract',
      'Comment',
      'UserComment',
      'XPComment'
    ];
    var exif = dnode.getValue('EXIF');
    for (var i = 0, key; key = possibleKeys[i]; i++) {
      var sv = exif.getValue(key);
      if (sv) return sv;
    }
    var sv = exif.setValue('Description', new js.hubb.ScalarNode(''));
    return sv;
  };

});
__DATA__
default-styles => @{
  %{
    selector => DIV.image-caption
    rule => %{
      display => none
    }
  }
  %{
    selector => DIV.image-caption.active
    rule => %{
      display => block
    }
  }
}
