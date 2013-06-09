js.extend('lsn.ext.wireframe.ui', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.Fragment = function (app, elemId) {
    CAction.apply(this);
    this.app = app;
    this.elemId = elemId;
    this.ui = new Object();
    this.app.addActionListener('onPageLoad', this.attach, this);
  };

  var Fragment = 
  this.Fragment.prototype = js.lang.createMethods(CAction);

  Fragment.attach = function () {
    function walk (node, cb) {
      js.lang.callback(cb, null, [node]);
      if (node.hasChildNodes()) {
        var child = node.firstChild;
        while (child) {
          walk(child, cb);
          child = child.nextSibling;
        }
      }
    }
    var rootElement = js.dom.getElement(this.elemId);
    walk(rootElement, [this.attachElement, this]);
  };

  Fragment.attachElement = function (elem) {
    if (!js.dom.node.isElement(elem)) return;
    // Bind to global-action emitter elements
    if (elem.tagName == 'BUTTON') {
      var value = js.dom.getAttribute(elem, 'value');
      if (value) {
        var parts = value.match(/^action:(.*)/);
        if (parts) {
          this.clickToAction(elem, parts[1]);
        }
      }
    }
    // Index identified elements
    var id = js.dom.getAttribute(elem, 'id');
    if (!id) return;
    if (this.ui[id]) throw 'Element ID is not unique: ' + id;
    this.ui[id] = elem;
  };

  Fragment.clickToAction = function (elem, name) {
    new js.dom.EventListener(elem, 'click', function (event, name) {
      js.dom.stopEvent(event);
      this.dispatchClassAction(name);
    }, this, [name]);
  };

});
