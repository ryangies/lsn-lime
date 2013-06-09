js.dom.addEventListener(js.document, 'load', function (event) {

  js.dom.addElementListener('a[rel="referrer"]', 'click', function (event, element) {
    js.dom.stopEvent(event);
    js.window.open(js.dom.getAttribute(element, 'href'));
  });

  function _onEvent (event, element) {
    var spec;
    if (element.tagName == 'A') {
      var href = js.dom.getAttribute(element, 'href');
      spec = new js.http.Location(href).getHash();
    } else if (element.tagName == 'BUTTON') {
      spec = js.dom.getAttribute(element, 'value');
    } else {
      throw new Error ('Unhandled adaptor element: ' + element.tagName);
      return;
    }
    var parts = spec.split(/:/);
    var type = parts.shift();
    var name = parts.shift();
    var arg = parts.join(':');
    var action = {
      'name': name,
      'event': event,
      'element': element
    };
    js.dom.stopEvent(event);
    if (type == 'action') {
      js.dom.executeAction(action, arg);
    } else if (type == 'handler') {
      env.invokeHandler(action, arg);
    } else {
      throw new Error ('Unhandled adaptor type: ' + type);
    }
  }

  js.dom.addElementListener('a[href^="#action:"]', 'click', _onEvent);
  js.dom.addElementListener('a[href^="#handler:"]', 'click', _onEvent);
  js.dom.addElementListener('button[value^="action:"]', 'click', _onEvent);
  js.dom.addElementListener('button[value^="handler:"]', 'click', _onEvent);

});
