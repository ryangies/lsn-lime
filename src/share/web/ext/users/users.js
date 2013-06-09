/** @namespace lsn.desktop.ext.users */
ECMAScript.Extend('lsn.desktop.ext.users', function (ecma) {

  var _dlgPassword = new ecma.lsn.Dialog('/res/hub/dlg/password.html', {
    'refetch': false,
    'onOk': function () {
      ecma.dom.removeClassNames(this.params.cell, 'edit');
      ecma.lsn.desktop.ext.users.save(this.params.props, this.params.key, 
        this.params.value, this.params.cell);
    },
    'onCancel': function () {
      ecma.dom.removeClassNames(this.params.cell, 'edit');
    }
  });

  this.save = function (props, key, value, cell) {
    ecma.dom.addClassNames(cell, 'save');
    new ecma.lsn.Request('[#`./module.pm`]/save', {
      onSuccess: function (resp) {
        var msg = resp.responseHash.get('body');
        if (msg == 'SUCCESS') {
          ecma.dom.removeClassNames(cell, 'save');
          props.set(key, value);
        } else {
          alert (msg);
        }
      },
      onFailure: function (resp) {
        alert (resp.responseText);
      }
    }).submit({'un': props.get('un'), 'key': key, 'value': value});
  };

  this.remove = function (props, row) {
    new ecma.lsn.Request('[#`./module.pm`]/remove', {
      onSuccess: function (resp) {
        var msg = resp.responseHash.get('body');
        if (msg == 'SUCCESS') {
          row.parentNode.removeChild(row);
        } else {
          alert (msg);
        }
      },
      onFailure: function (resp) {
        alert (resp.responseText);
      }
    }).submit({'un': props.get('un')});
  };

  /**
   * @class UserManager
   */

  this.UserManager = function () {
    this.ui = {
      'summary': ecma.dom.getElement('summary')
    };
  };

  this.UserManager.prototype = {

    list: function () {
      var req = new ecma.lsn.Request('[#`./module.pm/list`]')
      req.addEventListener('onSuccess', this._popui, this);
      req.submit();
    },

    add: function () {
      var row = this._mkrow(0, new ecma.data.OrderedHash());
      row.firstChild.firstChild.focus();
    },

    _popui: function (resp) {
      this.data = resp.responseHash.get('body/rows');
      this.fields = resp.responseHash.get('body/fields').toObject();
      this.data.iterate(this._mkrow, this);
    },

    _mkrow: function (idx, props) {
      var row = ecma.dom.createElement('tr');
      var cols = [];
      for (var i = 0, field_id; field_id = this.fields[i]; i++) {
        cols.push(field_id.match(/password/)
          ? this._mkpass(props, field_id)
          : this._mkinput(props, field_id)
        );
      }
      cols.push(this._mkcmds(props, row));
      ecma.dom.appendChildren(row, cols);
      var crow = this.ui.summary.childNodes[idx];
      if (crow) {
        this.ui.summary.insertBefore(row, crow);
      } else {
        this.ui.summary.appendChild(row);
      }
      return row;
    },

    _mkinput: function (props, key) {

      var cell, ctrl;

      cell = ecma.dom.createElement('td', {
        'onClick': function () {
          ctrl.focus();
        }
      });

      ctrl = ecma.dom.createElement('input', {
        'name': key,
        'value': props.get(key) || '',
        'onFocus': function () {
          ecma.dom.addClassNames(cell, 'edit');
        },
        'onBlur': function () {
          ecma.dom.removeClassNames(cell, 'edit');
        },
        'onChange': function (event) {
          ecma.lsn.desktop.ext.users.save(props, key, ctrl.value, cell);
        }
      });
      cell.appendChild(ctrl);
      return cell;
    },

    _mkpass: function (props, key) {

      var cell, ctrl;

      cell = ecma.dom.createElement('td', {'style': {'text-align': 'center'}});

      ctrl = ecma.dom.createElement('a', {
          'href': '',
          'innerHTML': '&bull;&bull;&bull;&bull;&bull;',
          'onClick': function (event) {
            ecma.dom.stopEvent(event);
            ecma.dom.addClassNames(cell, 'edit');
            _dlgPassword.show({'props': props, 'key': key, 'cell': cell});
          }
      });

      cell.appendChild(ctrl);
      return cell;
    },

    _mkcmds: function (props, row) {
      var cell, ctrl;

      cell = ecma.dom.createElement('td', {'style': {
        'text-align': 'center',
        'vertical-align': 'bottom',
        'font-size': '.8em'
      }});

      ctrl = ecma.dom.createElement('a', {
          'href': '',
          'innerHTML': 'Delete',
          'onClick': function (event) {
            ecma.dom.stopEvent(event);
            if (confirm('Confirm to delete: ' + props.get('un'))) {
              ecma.lsn.desktop.ext.users.remove(props, row);
            }
          }
      });

      cell.appendChild(ctrl);
      return cell;
    }

  };

});
