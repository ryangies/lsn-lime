js.extend('ext.ftp', function (js) {

  this.Main = function () {
    this.settings = new js.ext.ftp.Settings();
    this.view = new js.ext.ftp.View();
  };

  var _proto = this.Main.prototype = js.lang.createMethods();

  _proto.attachSimpleButtons = function (elem) {
    js.dom.appendChildren(elem, js.dom.createElements('div', [
      {#:for (button) in buttons/simple}
      'button={#button/text}',  {'onClick': [this.submitAction, this, ['{#button/action}']]},
      {#:end for}
      'INPUT', {
        'id':'cbox-toggle',
        'type':'checkbox',
        'onChange':[this.toggleAutohide, this]
      },
      'LABEL=Hide not-modified and excluded items', {
        'for':'cbox-toggle'
      }
    ]));
  };

  _proto.attachOutput = function (elem) {
    elem.appendChild(this.view.getRootElement());
  };

  _proto.attachAdvancedButtons = function (elem) {
    js.dom.appendChildren(elem, js.dom.createElements('div', [
      {#:for (button) in buttons/advanced}
      'button={#button/text}',  {'onClick': [this.submitAction, this, ['{#button/action}']]},
      {#:end for}
    ]));
  };

  _proto.attachSettings = function (elem) {
    elem.appendChild(this.settings.getRootElement());
    js.dom.appendChildren(elem, js.dom.createElements('div', [
      {#:for (button) in buttons/settings}
      'button={#button/text}',  {'onClick': [this.submitAction, this, ['{#button/action}']]},
      {#:end for}
    ]));
  };


  _proto.toggleAutohide = function (event) {
    var checkbox = js.dom.getEventTarget(event);
    this.view.setAutohide(checkbox.checked);
  };

  _proto.submitAction = function (event, name) {
    var req = new js.http.Stream('[#`./module.pm`]/' + name);
    req.addActionListener('onReceive', this.onReceive, this);
    req.addEventListener('onCreate', this.onCreate, this);
    req.addEventListener('onComplete', this.onComplete, this);
    req.submit(this.settings.getChangedValues());
  };

  _proto.onCreate = function (req) {
    var ctrls = js.dom.getElementsByTagName(js.dom.getBody(), 
      ['INPUT', 'SELECT', 'BUTTON']);
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
__DATA__
buttons => %{
  settings => @{
    %{
      text => Save Settings
      action => set_config
    }
  }
  simple => @{
    %{
      text => Publish
      action => publish
    }
  }
  advanced => @{
    %{
      text => Query
      action => query
    }
    %{
      text => Export
      action => export
    }
    %{
      text => Prepare
      action => prepare
    }
    %{
      text => Compare
      action => compare
    }
    %{
      text => Upload
      action => upload
    }
    %{
      text => Clean
      action => clean
    }
    %{
      text => Download remote (overwrite working files!)
      action => download
    }
  }
}
