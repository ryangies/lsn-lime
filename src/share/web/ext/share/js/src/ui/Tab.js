/** @namespace ext.share.ui */
js.extend('ext.share.ui', function (js) {

  var _package = this;

  _package.Tab = function (selector, target) {
    this.selector = selector;
    this.target = target;
    this.allowClose = true;
    this.createUI();
  };

  var _proto = _package.Tab.prototype = js.lang.createMethods(
  );

  _proto.getTarget = function () {
    return this.target;
  };

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.createUI = function () {
    this.uiIcon = js.dom.createElement('IMG');
    this.uiMark = js.dom.createElement('SPAN.mark.cell=New Tab');
    this.uiAnchor = js.dom.createElement('A.cell', {
     'onClick': [this.onClick, this]
    }, [
      'SPAN.icon.cell', [this.uiIcon],
      this.uiMark
    ]);
    this.uiClose = js.dom.createElement('A.close-tab', {
      'title': 'Close this tab',
      'onClick': [this.onClickClose, this]
    });
    this.uiRoot = js.dom.createElement('LI', [this.uiAnchor, this.uiClose]);
  };

  _proto.removeUI = function (action, target) {
    js.dom.removeElement(this.uiRoot);
  };

  _proto.onSelect = function (action) {
    js.dom.addClassName(this.uiAnchor, 'sel');
  };

  _proto.onDeselect = function (action) {
    js.dom.removeClassName(this.uiAnchor, 'sel');
  };

  _proto.onClick = function (event) {
    js.dom.stopEvent(event);
    this.selector.select(this.target);
  };

  _proto.onClickClose = function (event) {
    js.dom.stopEvent(event);
    this.target.close();
  };

});
