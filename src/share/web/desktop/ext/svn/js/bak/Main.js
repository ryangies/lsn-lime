js.extend('lsn.ext.svn', function (js) {

  var _meta = [#:json ./metadata.hf];

  var _proto = {};

  this.Main = function (uiRoot) {
    this.uiRoot = uiRoot;
    this.input = new js.local.Form('input');
    this.out = new js.local.View();
    this.svn = new js.lsn.ext.svn.Subversion(this.out);
    this.createUI();
    this.doStatus();
  };

  this.Main.prototype = _proto;

  _proto.attachInput = function (elem) {
    elem.appendChild(this.input.getRootElement());
  };

  _proto.attachButtons = function (elem) {
    var div = js.dom.createElement('DIV');
    js.dom.appendChild(elem, div);
    js.local.settings.get('buttons').iterate(function (idx, button) {
      js.dom.appendChildren(div, js.dom.createElements('BUTTON', {
        'onClick': [this.submitAction, this, [button]],
        'innerHTML': button.getString('text')
      }, '#text= '));
    }, this);
  };

  _proto.attachOutput = function (elem) {
    elem.appendChild(this.out.getRootElement());
  };

  _proto.submitAction = function (event, button) {
    var name = button.getString('action');
    var confirmation = button.getString('confirm');
    if (confirmation && !confirm(confirmation)) return;
    this.svn.submit(name, this.input.getValues());
  };

  _proto.createUI = function () {
    this.uiAbout = js.dom.createElement('div#about');
    this.uiStatus = js.dom.createElement('div#status');
    this.uiOutput = js.dom.createElement('div#output');
    js.dom.replaceChildren(this.uiRoot, [
      this.uiAbout,
      this.uiStatus,
      this.uiOutput,
    ]);
  };

  _proto.displayStatus = function (rows) {
    this.uiTbody = js.dom.createElement('tbody', rows);
    this.uiTable = js.dom.createElement('table', [
      'thead', ['tr', [
        'th',
        'th=Action',
        'th=Status',
        'th=Path',
      ]],
      this.uiTbody
    ]);
    this.uiBtnRefresh = js.dom.createElement('button', {
      'onClick': [this.doStatus, this],
      'innerHTML': "Refresh"
    });
    this.uiBtnCommit = js.dom.createElement('button', {
      'onClick': [this.doCommit, this],
      'innerHTML': "Commit changes to repository"
    });
    this.uiBtnUpdate = js.dom.createElement('button', {
      'onClick': [this.doUpdate, this],
      'innerHTML': "Update from repository"
    });
    js.dom.replaceChildren(this.uiStatus, [
      this.uiTable,
      this.uiBtnRefresh,
      this.uiBtnCommit,
      this.uiBtnUpdate
    ]);
  };

  _proto.exec = function (command) {
    this.svn.submit('exec', {'command': command});
  };

  _proto.doStatus = function (event) {
    var req = new js.lsn.Request('[#`./module.pm/status`]');
    var mask = new js.lsn.Mask();
    req.addEventListener('onSuccess', function (req) {
      var result = req.responseHash.getValue('body').toObject();
      var rows = [];
      for (var i = 0, item; item = result[i]; i++) {
        rows.push(js.dom.createElement('tr', {
          'class': 'checked ' + item['status']
        }, [
          'td', ['input', {
            'type': 'checkbox',
            'autocomplete': 'off',
            'onclick': [this.onToggle, this, [item]],
            'checked': 'checked',
            'name': 'item:' + item['uid'],
            'value': item['path']
          }],
          'td', [this.createActionDropdown(item['uid'], item['status'])],
          'td', [this.getStatusText(item['status'])],
          'td', ['A', {'href': item['path'], 'innerHTML': item['path'], 'target': '_blank'}]
        ]));
      }
      this.displayStatus(rows);
    }, this);
    req.addEventListener('onComplete', function (req) {
      mask.hide();
    }, this);
    mask.show();
    req.submit();
  };

  _proto.doUpdate = function (event) {
    var req = new js.lsn.Request('[#`./module.pm/update`]');
    var mask = new js.lsn.Mask();
    req.addEventListener('onComplete', function (req) {
      mask.hide();
      var result = req.responseHash.getValue('body').toObject();
      this.showOutput(result);
      this.doStatus();
    }, this);
    mask.show();
    req.submit();
  };

  _proto.doCommit = function (event) {
    var comment = prompt('Please enter your comment:');
    if (comment === null) return;
    var req = new js.lsn.Request('[#`./module.pm/commit`]');
    var mask = new js.lsn.Mask();
    req.addEventListener('onSuccess', function (req) {
      var result = req.responseHash.getValue('body').toObject();
      this.showOutput(result);
      this.doStatus();
    }, this);
    req.addEventListener('onFailure', function (req) {
      alert(req.xhr.statusText);
    }, this);
    req.addEventListener('onComplete', function (req) {
      mask.hide();
    }, this);
    var values = js.dom.getValues(this.uiTbody);
    values.comment = comment;
    req.submit(values);
    mask.show();
  };

  _proto.onToggle = function (event) {
    var cbox = js.dom.getEventTarget(event);
    var td = cbox.parentNode;
    var tr = td.parentNode;
    if (js.dom.getValue(cbox)) {
      js.dom.addClassName(tr, 'checked');
    } else {
      js.dom.removeClassName(tr, 'checked');
    }
  };

  _proto.getStatusText = function (status) {
    var statusMessage = _meta['status_text'][status] || 'ERROR!';
    var text = status + ' (' + statusMessage + ')';
    return js.dom.createElement('#text=' + text);
  };

  _proto.createActionDropdown = function (id, status) {
    var options = [];
    var selected = _meta['default_action'][status] || 'skip';
    for (var i = 0, props; props = _meta['actions'][i]; i++) {
      var opt = js.dom.createElement('option', props);
      if (props.value == selected) {
        js.dom.setAttribute(opt, 'selected', 'selected');
      }
      options.push(opt);
    };
    return js.dom.createElement('select', {'name': 'action:' + id}, options);
  };

  _proto.showOutput = function (lines) {
    for (var i = 0; i < lines.length; i++) {
      this.uiOutput.appendChild(
        js.dom.createElement('p', {innerHTML: lines[i]}));
    }
  };

});
