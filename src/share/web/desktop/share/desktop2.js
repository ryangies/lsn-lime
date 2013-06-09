ECMAScript.Extend('lsn.desktop', function (ecma) {

  var CPage = js.lsn.ui.Page;
  var CPrompt = js.lsn.ui.Prompt;

  this.Desktop = function () {
    CPage.apply(this);
    CPrompt.apply(this);
    this.tabset = null;
    this.hub = null;
  }

  var Desktop = this.Desktop.prototype = ecma.lang.createMethods (
    CPage,
    CPrompt
  );

  Desktop.onPageLoad = function () {
    this.tabset = new js.res.Tabset('lh-tabs', 'rh-tabs', 'workspace');
    this.tabset.rightHandOnly();
  };

  Desktop.createTab = function (props) {
    return this.tabset.createTab(props);
  };

});

