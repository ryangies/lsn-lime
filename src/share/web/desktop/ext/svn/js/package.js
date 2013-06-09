js.extend('local', function (js) {

  this.settings = [#:js:var ./settings.hf];
  this.config = [#:js:var ./module.pm/get_config];
  this.app = new js.lsn.ext.svn.app.Application();

});
