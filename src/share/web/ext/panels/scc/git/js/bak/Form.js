js.extend('local', function (js) {

  var CForm = js.lsn.forms.Form;

  this.Form = function (id) {
    CForm.call(this, js.local.settings.get(id), js.local.config);
  };

  var Form = this.Form.prototype = js.lang.createMethods(CForm);

});
