js.extend('ext.images', function (js) {

  var CForm = js.lsn.forms.Form;

  this.Form = function (id) {
    CForm.call(this, js.ext.images.settings.get(id), js.ext.images.config);
  };

  var Form = this.Form.prototype = js.lang.createMethods(CForm);

});
