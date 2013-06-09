js.extend('local', function (js) {

  var CForm = js.lsn.forms.Form;

  this.Settings = function () {
    CForm.call(this, [#:js:var ./settings.hf], [#:js:var ./module.pm/get_config]);
  };

  var _proto = this.Settings.prototype = js.lang.createMethods(CForm);

});
