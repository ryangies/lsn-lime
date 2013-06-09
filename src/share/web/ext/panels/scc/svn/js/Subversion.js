js.extend('lsn.ext.svn', function (js) {

  var CHTTPStream = js.http.Stream;

  this.Subversion = function (command, view) {
    CHTTPStream.call(this, '[#`./module.pm`]/' + command);
    this.view = view;
    this.mask = new js.lsn.Mask();
  };

  var _proto = this.Subversion.prototype = js.lang.createMethods(
    CHTTPStream
  );

  _proto.onCreate = function () {
    this.mask.show();
  };

  _proto.onComplete = function () {
    this.mask.hide();
  };

  _proto.onReceive = function (data) {
    this.view.updateUI(data);
  };

});
