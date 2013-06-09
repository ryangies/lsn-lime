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
