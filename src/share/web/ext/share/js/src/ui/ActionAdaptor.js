js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CBase = js.dom.ActionAdaptor;

  _package.ActionAdaptor = function () {
    CBase.apply(this, arguments);
  };

  var _proto = _package.ActionAdaptor.prototype = js.lang.createMethods(
    CBase
  );

  _proto.attach = function (elem) {
    var action = null;
    switch (elem.tagName) {
      case 'A':
        var href = js.dom.getAttribute(elem, 'href');
        if (href) {
          action = new js.http.Location(href).getHash();
        }
        break;
      case 'BUTTON':
        action = js.dom.getAttribute(elem, 'value');
        break;
    }
    if (action) {
      this.createListener(elem, action);
    }
    return false;
  };

});
