js.extend('ext.ftp', function (js) {

  this.Main = function () {
    this.pm = new js.ext.ftp.PerlModule();
    this.settings = new js.ext.ftp.Settings();
    this.view = new js.ext.ftp.View();
  };

  var _proto = this.Main.prototype = js.lang.createMethods();

  _proto.attach = function (elem) {
    elem.appendChild(this.settings.getRootElement());
    js.dom.appendChildren(elem, js.dom.createElements('div', [
      {#:for (button) in buttons}
      'button={#button/text}',  {'onClick': [this.submitAction, this, ['{#button/action}']]},
      {#:end for}
    ]));
    elem.appendChild(this.view.getRootElement());
    this.settings.focus();
  };

  _proto.submitAction = function (event, name) {
    var params = this.settings.getChangedValues();
    this.pm.submit(name, params, [this.onResult, this]);
  };

  _proto.onResult = function (data, req) {
    if (js.util.isa(data, js.data.HashList)) {
      this.view.updateUI(data);
    } else {
      alert(req.xhr.responseText || req.xhr.statusText);
    }
  };

});
__DATA__
buttons => @{

  %{
    text => Save Settings
    action => set_config
  }
  %{
    text => Fetch Remote
    action => fetch_remote
  }
  %{
    text => Fetch Local
    action => fetch_local
  }
  %{
    text => Compare
    action => compare
  }
  %{
    text => Upload Changes
    action => upload_changes
  }
  
    
  %{
    text => Backup Remote
    action => backup_remote
  }
  %{
    text => Delete Remote
    action => delete_remote
  }
  %{
    text => Delete Local
    action => delete_local
  }
  %{
    text => Prune
    action => prune
  }
}
