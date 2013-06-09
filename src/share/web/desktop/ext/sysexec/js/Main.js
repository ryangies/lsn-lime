js.extend('local', function (js) {

  this.Main = function () {
    this.input = new js.local.Form('input');
    this.view = new js.local.View();
  };

  var _proto = this.Main.prototype = js.lang.createMethods();

  _proto.attachButtons = function (elem) {
    var div = js.dom.createElement('DIV');
    js.dom.appendChild(elem, div);
    js.local.settings.get('buttons').iterate(function (idx, button) {
      js.dom.appendChildren(div, js.dom.createElements('BUTTON', {
        'onClick': [this.submitAction, this, [button]],
        'innerHTML': button.getString('text')
      }, '#text= '));
    }, this);
  };

  _proto.attachOutput = function (elem) {
    elem.appendChild(this.view.getRootElement());
  };

  _proto.attachInput = function (elem) {
    elem.appendChild(this.input.getRootElement());
  };

  _proto.submitAction = function (event, button) {
    var name = button.getString('action');
    var confirmation = button.getString('confirm');
    if (confirmation && !confirm(confirmation)) return;
    var req = new js.http.Stream('[#`./module.pm`]/' + name);
    req.addActionListener('onReceive', this.onReceive, this);
    req.addEventListener('onCreate', this.onCreate, this);
    req.addEventListener('onComplete', this.onComplete, this);
    req.submit(this.input.getValues());
  };

  _proto.onCreate = function (req) {
    var ctrls = js.dom.getElementsByTagName(js.dom.getBody(), ['INPUT', 'SELECT', 'BUTTON']);
    for (var i = 0, ctrl; ctrl = ctrls[i]; i++) {
      js.dom.setAttribute(ctrl, 'disabled', 'disabled');
    }
    this.view.clear();
  };

  _proto.onReceive = function (action, data) {
    this.view.updateUI(data);
  };

  _proto.onComplete = function (req) {
    var ctrls = js.dom.getElementsByTagName(js.dom.getBody(), ['INPUT', 'SELECT', 'BUTTON']);
    for (var i = 0, ctrl; ctrl = ctrls[i]; i++) {
      js.dom.removeAttribute(ctrl, 'disabled');
    }
  };

});
