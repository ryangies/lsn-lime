// @namespace lsn.ext.svn.app
js.extend('lsn.ext.svn.app', function (js) {

  var CApplication = js.lsn.app.Application;

  /**
   * @class Application
   * Controller class for this extension module.
   */

  this.Application = function () {
    CApplication.apply(this);
    this.ctrls = null;
    this.diffView = new js.lsn.ext.svn.view.DiffView(this);
    this.outputView = new js.lsn.ext.svn.view.OutputView(this);
    this.statusView = new js.lsn.ext.svn.view.StatusView(this);
  };

  var _proto = this.Application.prototype = js.lang.createMethods(
    CApplication
  );

  /**
   * @function onPageLoad
   * @overrides CApplication
   */

  _proto.onPageLoad = function (event) {
    CApplication.prototype.onPageLoad.apply(this, arguments);
    this.ui.outputArea.appendChild(this.diffView.getRootElement());
    this.ui.outputArea.appendChild(this.outputView.getRootElement());
    this.ui.statusArea.appendChild(this.statusView.getRootElement());
    this.doRefresh();
  };

  /**
   * @function doToggle
   * Toggle the display of the specified element.
   */

  _proto.doToggle = function (handle, elemId) {
    js.dom.toggleDisplay(elemId);
    js.dom.toggleClassName(handle, 'sel');
  };

  /**
   * @function clearOutput
   */

  _proto.clearOutput = function () {
    this.diffView.clear();
    this.outputView.clear();
  };

  /**
   * @function doExec
   * Execute a subversion command.
   */

  _proto.doExec = function (handle, command) {
    this.clearOutput();
    var svn = new js.lsn.ext.svn.Subversion('exec', this.outputView);
    svn.submit({'command': command});
  };

  /**
   * @function doRefresh
   * Fetch the status of the working directories.
   */

  _proto.doRefresh = function (handle) {
    this.statusView.clear();
    var svn = new js.lsn.ext.svn.Subversion('status', this.statusView);
    svn.submit();
  };

  /**
   * @function doCommit
   * Commit select changes to repository.
   */

  _proto.doCommit = function (handle) {
    this.clearOutput();
    var comment = prompt('Please enter your comment:');
    if (comment === null) return;
    var svn = new js.lsn.ext.svn.Subversion('commit', this.outputView);
    var values = js.dom.getValues(this.ui.statusArea);
    values.comment = comment;
    svn.addEventListener('onSuccess', function (req) {
      this.doRefresh();
    }, this);
    svn.submit(values);
  };

  /**
   * @function doDiff
   * Execute a subversion diff of the given file.
   */

  _proto.doDiff = function (handle, path) {
    this.clearOutput();
    var svn = new js.lsn.ext.svn.Subversion('diff', this.diffView);
    svn.submit({'path': path});
  };

});
