js.extend('lsn.ext.svn.view', function (js) {

  var CView = js.lsn.ext.svn.view.View;

  this.OutputView = function () {
    CView.apply(this, arguments);
  };

  var OutputView = this.OutputView.prototype = js.lang.createMethods(CView);

  OutputView.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  OutputView.createUI = function () {
    return this.uiRoot = js.dom.createElement('DIV.results');
  };

  OutputView.clear = function () {
    var root = this.getRootElement();
    js.dom.removeChildren(root);
  };

  OutputView.updateUI = function (data) {
    var part = typeof(data) == 'string'
      ? ['result', data]
      : data.getObject();
    var line = js.dom.createElement('DIV', [
      'PRE.' + part[0], [
        '#text', {
          'nodeValue': part[1]
        }
      ]
    ]);
    js.dom.appendChild(this.getRootElement(), line);
  }

});
