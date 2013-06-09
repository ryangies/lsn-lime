
js.extend('lsn.ext.svn.view', function (js) {

  var CView = js.lsn.ext.svn.view.View;

  this.DiffView = function () {
    CView.apply(this, arguments);
  };

  var DiffView = this.DiffView.prototype = js.lang.createMethods(CView);

  DiffView.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  DiffView.createUI = function () {
    return this.uiRoot = js.dom.createElement('DIV');
  };

  DiffView.clear = function () {
    var root = this.getRootElement();
    js.dom.removeChildren(root);
  };

  DiffView.updateUI = function (data) {
    var part = typeof(data) == 'string'
      ? ['result', data]
      : data.getObject();
    var pre = null;
    if (part[0] === 'result') {
      pre = this.highlight(part[1] + "\r\n");
    } else if (part[0] === 'status') {
      pre = js.dom.createElement(
        'PRE.status', ['#text', {'nodeValue': part[1]}]
      );
    }
    if (pre) js.dom.appendChild(this.uiRoot, pre);
  };

  DiffView.highlight = function (line) {
    var pre = js.dom.createElement('PRE', ['#text', {'nodeValue': line}]);
    var classNames = ['result'];
    var isFinal = false;
    [#:for (syn) in "./syntax.hf/diff"]
    if (!isFinal && line.match([#syn/match])) {
      classNames.push('[#syn/name]');
      isFinal = '[#syn/final]' ? true : false;
    }
    [#:end for]
    js.dom.addClassNames(pre, classNames);
    return pre;
  };

});
