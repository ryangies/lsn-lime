js.extend('lsn.ext.svn.view', function (js) {

  this.View = function (app) {
    this.app = app;
  };

  var _proto = this.View.prototype = js.lang.createMethods();

  _proto.disableControls = function () {
    this.ctrls = js.dom.getElementsByTagName(js.dom.getBody(),
      ['INPUT', 'SELECT', 'BUTTON']);
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      js.dom.setAttribute(ctrl, 'disabled', 'disabled');
    }
  };

  _proto.enableControls = function () {
    for (var i = 0, ctrl; ctrl = this.ctrls[i]; i++) {
      js.dom.removeAttribute(ctrl, 'disabled');
    }
  };

});


js.extend('lsn.ext.svn.view', function (js) {

  var CView = js.lsn.ext.svn.view.View;
  var _meta = [#:json ./metadata.hf];

  this.StatusView = function () {
    CView.apply(this, arguments);
    this.cboxStates = {};
  };

  var _proto = this.StatusView.prototype = js.lang.createMethods(CView);

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.createUI = function () {
    this.uiMessages = js.dom.createElement('div');
    this.uiButtons = js.dom.createElement('div');
    this.uiTbody = js.dom.createElement('tbody');
    this.uiToggleAll = js.dom.createElement('input', {
      'type': 'checkbox',
      'checked': 'checked',
      'onChange': [this.onToggleAll, this]
    });
    this.uiRoot = js.dom.createElement('div', [
      'table', [
        'thead', ['tr', [
          'th', [this.uiToggleAll],
          'th=Action',
          'th=Status',
          'th=Path',
        ]],
        this.uiTbody
      ],
      this.uiButtons,
      this.uiMessages
    ]);
    this.uiBtnCommit = js.dom.createElement('button', {
      'type': 'button',
      'value': 'action:doCommit',
      'innerHTML': "Commit changes to repository"
    });
    this.app.attachElement(this.uiBtnCommit);
    return this.uiRoot;
  };

  _proto.onToggleAll = function (event) {
    var toggleBox = js.dom.getEventTarget(event);
    var isChecked = js.dom.getValue(toggleBox);
    var checkBoxes = js.dom.getElementsByTagName(this.uiTbody, 'INPUT');
    for (var i = 0, checkBox; checkBox = checkBoxes[i]; i++) {
      if (js.dom.hasClassName(checkBox, 'status-I')) continue;
      js.dom.setValue(checkBox, isChecked ? true : false);
      this.applyCheckboxState(checkBox);
    }
  };

  _proto.clear = function () {
    js.dom.removeChildren(this.uiTbody);
    js.dom.removeChildren(this.uiMessages);
    js.dom.removeElement(this.uiBtnCommit);
    js.dom.setClassName(this.uiMessages, '');
    js.dom.setValue(this.uiToggleAll, true);
  };

  _proto.updateUI = function (data) {
    var result = data.getObject();
    var errors = [];
    var rows = [];
    for (var i = 0, item; item = result[i]; i++) {
      if (!item['status']) {
        errors.push(item['output']);
        continue;
      }
      var name = 'item:' + item['uid'];
      var wasChecked = this.cboxStates[name];
      var isChecked = js.util.defined(wasChecked)
        ? wasChecked
        : item['status'] != 'I';
      var checkBox = js.dom.createElement('input', {
        'class': 'status-' + item['status'],
        'type': 'checkbox',
        'autocomplete': 'off',
        'onclick': [this.onToggle, this, [item]],
        'name': name,
        'value': item['path']
      });
      if (isChecked) js.dom.setValue(checkBox, true);
      var pathColumn = ['A', {
        'href': item['path'],
        'innerHTML': item['path'],
        'target': '_blank'
      }];
      if (item['status'] == 'M') {
        var btnDiff = js.dom.createElement('A.action', {
          'href': '#action:doDiff:' + item['path'],
          'innerHTML': 'diff'
        });
        this.app.attachElement(btnDiff);
        pathColumn.push('#text= (', btnDiff, '#text=)');
      }
      
      var select = this.createActionDropdown(item['uid'], item['status']);
      var tr = js.dom.createElement('tr', {
        'class': item['status'] + (isChecked ? ' checked' : ''),
      }, [
        'td', [checkBox],
        'td', [select],
        'td', [this.getStatusText(item['status'])],
        'td', pathColumn
      ]);
      js.dom.addEventListener(select, 'change', this.onChangeAction, this, [select, tr]);
      this.onChangeAction(null, select, tr);
      rows.push(tr);
    }
    if (rows.length > 0) {
      js.dom.appendChildren(this.uiTbody, rows);
      js.dom.appendChild(this.uiButtons, this.uiBtnCommit);
    }
    if (errors.length > 0) {
      js.dom.addClassName(this.uiMessages, 'error');
      for (var i = 0; i < errors.length; i++) {
        js.dom.appendChildren(this.uiMessages,
          js.dom.createElements('CODE', ['#text', {'nodeValue': errors[i]}], 'BR')
        );
      }
    }
  };

  _proto.onChangeAction = function (event, select, tr) {
    var option = select.children[select.selectedIndex];
    var cssClass = js.dom.hasClassName(tr, 'checked') ? 'checked ' : '';
    cssClass += option.value;
    js.dom.setAttribute(tr, 'class', cssClass);
  };

  _proto.onToggle = function (event) {
    var cbox = js.dom.getEventTarget(event);
    this.applyCheckboxState(cbox);
  };

  _proto.applyCheckboxState = function (cbox) {
    var td = cbox.parentNode;
    var tr = td.parentNode;
    var isChecked = js.dom.getValue(cbox) ? true : false;
    if (isChecked) {
      js.dom.addClassName(tr, 'checked');
    } else {
      js.dom.removeClassName(tr, 'checked');
    }
    var name = js.dom.getAttribute(cbox, 'name');
    this.cboxStates[name] = isChecked;
  };

  _proto.createActionDropdown = function (id, status) {
    var options = [];
    var selected = _meta['default_action'][status] || 'skip';
    for (var i = 0, props; props = _meta['actions'][i]; i++) {
      var opt = js.dom.createElement('option.' + props.value, props);
      if (props.value == selected) {
        js.dom.setAttribute(opt, 'selected', 'selected');
      }
      options.push(opt);
    };
    return js.dom.createElement('select', {'name': 'action:' + id}, options);
  };

  _proto.getStatusText = function (status) {
    var statusMessage = _meta['status_text'][status] || 'ERROR!';
    var text = status + ' (' + statusMessage + ')';
    return js.dom.createElement('#text=' + text);
  };

});

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

js.extend('lsn.ext.svn', function (js) {

  var CHTTPStream = js.http.Stream;

  this.Subversion = function (command, view) {
    CHTTPStream.call(this, '[#`./module.pm`]/' + command);
    this.view = view;
    this.mask = new js.lsn.Mask();
  };

  var _proto = this.Subversion.prototype = js.lang.createMethods(
    CHTTPStream
  );

  _proto.onCreate = function () {
    this.mask.show();
  };

  _proto.onComplete = function () {
    this.mask.hide();
  };

  _proto.onReceive = function (data) {
    this.view.updateUI(data);
  };

});

js.extend('local', function (js) {

  this.settings = [#:js:var ./settings.hf];
  this.config = [#:js:var ./module.pm/get_config];
  this.app = new js.lsn.ext.svn.app.Application();

});

