js.extend('lsn.ext.dde', function (js) {

  var proto = {};

  this.StatusBar = function (elem) {
    this.ui = js.dom.getElement(elem);
    this.history = [];
    this.timeout = 4000;
    this.tidFlash = null;
  };

  this.StatusBar.prototype = proto;

  proto.set = function (text) {
    this.clear();
    this.history.push(text);
    var elem = js.dom.createElement('span.msg', {'innerHTML': text});
    js.dom.replaceChildren(this.ui, [elem]);
    return elem;
  };

  proto.setChildren = function () {
    this.clear();
    js.dom.replaceChildren(this.ui, arguments);
  };

  proto.clear = function () {
    if (this.tidFlash) js.dom.clearTimeout(this.tidFlash);
    this.tidFlash = null;
    js.dom.removeChildren(this.ui);
  };

  proto.flash = function (text) {
    this.set(text);
    this.tidFlash = js.dom.setTimeout(this.clear, this.timeout, this);
  };

  proto.notify = function (text) {
    env.status.notify(text);
    return;
    var vp = js.dom.getViewportPosition();
    var msgElem = js.dom.createElement('span', {
      'innerHTML': text,
      'style': {'font-size':'12px'}
    });
    js.dom.replaceChildren(this.ui, [msgElem]); // must be part of the DOM for getWidth
    var pad = 12;
    var width = js.dom.getWidth(msgElem) + (2*pad);
    var left = (vp.width/2) - (width/2);
    var wrapElem = js.dom.createElement('div', {
      'class': 'statusNotify',
      'style': {
        'position': 'absolute',
        'top': (vp.height/5) + 'px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    }, [msgElem]);
    js.dom.getBody().appendChild(wrapElem);
    js.dom.setStyle(msgElem, 'visibility', 'visible');
    js.dom.setTimeout(js.dom.removeElement, this.timeout, null, [wrapElem]);
    this.flash(text);
  };

});
