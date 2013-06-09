js.extend('ext.desktop', function (js) {

  var _package = this;
  var CSwitchable = js.ext.share.ui.Switchable;

  var CPanel = _package.Panel = function (url) {
    this.url = url;
    this.createElements();
    CSwitchable.call(this, url, this.iframe);
  };

  var _proto = CPanel.prototype = js.lang.createMethods(CSwitchable);

  _proto.createElements = function () {
    this.iframe = js.dom.createElement('IFRAME', {
      'frameBorder': '0',
      'allowTransparency': 'true',
      'class': 'layout1-area4',
      'src': this.url
    });
  };

  _proto.onReload = function () {
    try {
      var iwin = js.dom.getContentWindow(this.iframe);
      var msg = 'Reload ' + iwin.document.title + '?';
      env.status.confirm(msg, [function (ok) {
        if (!ok) return;
          iwin.document.location.reload();
      }, this]);
    } catch (ex) {
    }
  };

});
