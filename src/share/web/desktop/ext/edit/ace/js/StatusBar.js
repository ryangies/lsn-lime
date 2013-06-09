js.extend('lsn.desktop.ext.edit.ace', function (js) {

  this.StatusBar = function (eStatusBarId) {
    this.parentElement = js.dom.getElement(eStatusBarId);
    this.popups = [];
    this.timeout = 3000;
  };

  var StatusBar = this.StatusBar.prototype = js.lang.createMethods();

  StatusBar.createPopup = function (cssClass, childNodes) {
    var vp = js.dom.getViewportPosition();
    var pad = 12;
    var width = (vp.width/4) + (2*pad);
    var left = (vp.width/2) - (width/2);
    var popup = js.dom.createElement('div', {
      'style': {
        'position': 'absolute',
        'top': (vp.height/5) + 'px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    }, childNodes);
    js.dom.addClassName(popup, 'statusPopup');
    js.dom.addClassName(popup, cssClass);
    this.popups.push(popup);
    js.dom.getBody().appendChild(popup);
    return popup;
  };

  StatusBar.notify = function (text) {
    var contents = js.dom.createElements(
      'span', {
        'innerHTML': text,
        'style': {'font-size':'12px'}
      }
    );
    this.createPopup('statusNotify', contents);
    js.dom.setTimeout(this.removePopup, this.timeout, this);
  };

  StatusBar.alert = function (text) {
    var contents = js.dom.createElements(
      'span', {
        'innerHTML': text,
        'style': {'font-size':'12px'}
      },
      'div.footerButtons', [
        'button=OK', {
          'onClick': [this.removePopup, this]
        }
      ]
    );
    this.createPopup('statusAlert', contents);
  };

  StatusBar.removePopup = function (event) {
    js.dom.stopEvent(event);
    var elem = this.popups.shift();
    if (elem) js.dom.removeElement(elem);
  };

});
