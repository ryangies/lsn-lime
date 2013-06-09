ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  var proto = {};

  this.StatusBar = function (elem) {
    this.ui = ecma.dom.getElement(elem);
    this.history = [];
    this.timeout = 4000;
    this.tidFlash = null;
  };

  this.StatusBar.prototype = proto;

  proto.set = function (text) {
    this.clear();
    this.history.push(text);
    var elem = ecma.dom.createElement('span', {'innerHTML': text});
    ecma.dom.replaceChildren(this.ui, [elem]);
    return elem;
  };

  proto.setChildren = function () {
    this.clear();
    ecma.dom.replaceChildren(this.ui, arguments);
  };

  proto.clear = function () {
    if (this.tidFlash) ecma.dom.clearTimeout(this.tidFlash);
    this.tidFlash = null;
    ecma.dom.removeChildren(this.ui);
  };

  proto.flash = function (text) {
    this.set(text);
    this.tidFlash = ecma.dom.setTimeout(this.clear, this.timeout, this);
  };

  proto.notify = function (text) {
    var vp = js.dom.getViewportPosition();
    var msgElem = ecma.dom.createElement('span', {
      'innerHTML': text,
      'style': {'font-size':'12px'}
    });
    ecma.dom.replaceChildren(this.ui, [msgElem]); // must be part of the DOM for getWidth
    var pad = 12;
    var width = ecma.dom.getWidth(msgElem) + (2*pad);
    var left = (vp.width/2) - (width/2);
    var wrapElem = ecma.dom.createElement('div', {
      'class': 'statusNotify',
      'style': {
        'position': 'absolute',
        'top': (vp.height/5) + 'px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    }, [msgElem]);
    ecma.dom.getBody().appendChild(wrapElem);
    ecma.dom.setStyle(msgElem, 'visibility', 'visible');
    ecma.dom.setTimeout(ecma.dom.removeElement, this.timeout, null, [wrapElem]);
    this.flash(text);
  };

});
