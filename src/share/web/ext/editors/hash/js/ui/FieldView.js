/** @namespace ext.editors.hash.ui */
js.extend('ext.editors.hash.ui', function (js) {

  var _package = this;
  var CNodeLayer = js.data.NodeLayer;
  var CView = js.ext.share.ui.View;

  _package.FieldView = function () {
    CNodeLayer.apply(this, arguments);
    CView.call(this);
  };

  var _proto =
      _package.FieldView.prototype = js.lang.createMethods(
        CNodeLayer,
        CView
      );

  _proto.createElements = function () {
    this.uiRoot = js.dom.createElement('TR.FieldView');
    return [this.uiRoot];
  };

  _proto.onAdopted = function () {
    var field = this.node;
    if (field.isHidden()) return;
    var elements = js.dom.createElements(
      'TH.field-view-term', [
        'LABEL', {innerHTML: field.getLabelText()},
        'DIV', field.getMenuElements()
      ],
      'TD.field-view-definition', [
        'P.description', {innerHTML: field.getDescriptionText()},
        'DIV.input', field.getElements()
      ]
    );
    js.dom.replaceChildren(this.uiRoot, elements);
  };

});
