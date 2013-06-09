var kp = new js.dom.KeyPress();
kp.addHandler('backspace', function (event) {
  if (js.dom.getEventTarget(event) === js.window) {
    // Supress the backspace key (history back) to prevent accidental 
    // navigation when an input loses focus.
    js.dom.stopEvent(event);
  }
});
kp.attach(js.window);

env = new js.ext.share.Environment();

var version = 0.3;
var layoutHead = env.layout.addRow('layout-head', 30);
var layoutBody = env.layout.addRow('layout-body', null, [1,0,0,0]);
var layoutFoot = env.layout.addRow('layout-foot', 20, [1,0,0,0]);
var pageLocation = new js.http.Location();

env.addActionListener('onUpdateTitle', function (action, title) {
  js.document.title = 'LIME: ' + title + ' (' + pageLocation.hostname + ')';
});

env.addActionListener('onUpdateSubtitle', function (action, subtitle) {
  var sep = ': ';
  var parts = new String(js.document.title || '').split(sep, 1);
  parts.push(subtitle);
  js.document.title = parts.join(sep);
});

env.layout.addActionListener('onPageLoad', function (action) {
  var elem = js.dom.getElement('about-lime');
  if (elem) {
    var html = 'You are using the Livesite Integrated Management Environment (LIME)';
    html += ': version ' + version;
    js.dom.setValue(elem, html);
  }
});

[#./adaptors.js]

/** Browser Navigation */

var startLocation = new js.http.Location();
var startScreen = null;
var stateUriMap = {};

env.registerHandler('gotoScreen', function (action, addr) {
  var screen = env.screens.get(addr);
  if (screen && screen !== env.screens.getSelected()) {
//  js.console.log('gotoScreen', addr);
    env.screens.select(screen);
  }
});

env.screens.addActionListener('onSelect', function (action, screen) {
  var uri = screen.addr;
  var method = 'pushState';
  if (!startScreen) {
    method = 'replaceState';
    uri = startLocation.getHref();
    startScreen = screen;
  } else {
    uri = stateUriMap[screen.addr] || uri;
  }
  stateUriMap[screen.addr] = uri;
  var data = {
    addr: screen.addr
  };
//js.console.log(method, uri);
  js.platform.history[method](data, null, uri);
});

js.platform.history.Adapter.bind(js.window, 'statechange', function (event) {
  var state = js.platform.history.getState();
  env.invokeHandler('gotoScreen', state.data.addr);
});

env.registerHandler('window-open', function (action, url) {
  var loc = new js.http.Location(url);
  js.window.open(loc.getHref());
});
