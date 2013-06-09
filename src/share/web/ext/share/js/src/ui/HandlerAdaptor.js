js.extend('ext.share.ui', function (js) {

  var _package = this;
  var CBase = _package.ActionAdaptor;

  _package.ActionAdaptor = function () {
    CBase.apply(this, arguments);
    this.keyword = 'handler';
  };

  var _proto = _package.ActionAdaptor.prototype = js.lang.createMethods(
    CBase
  );

});
