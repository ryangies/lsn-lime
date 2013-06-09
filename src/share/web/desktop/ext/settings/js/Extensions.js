js.extend('lsn.ext.settings', function (js) {

  var Proto = {};

  this.Extensions = function (main) {
    this.main = main;
    this.data = main.getData();
    this.createUI();
  };

  this.Extensions.prototype = Proto;

  Proto.createUI = function () {
    this.main.appendChild(js.dom.createElement('h2=Desktop Menu'));
    this.divExtList = js.dom.createElement('div#extlist');
    var entries = this.data.get('menu_entries').toObject();
    for (var j = 0, entry; entry = entries[j]; j++) {
      this.divExtList.appendChild(js.dom.createElement('h3=' + entry.heading));
      var divItems = this.divExtList.appendChild(js.dom.createElement('div.mm'));
      for (var i = 0, module; module = entry.modules[i]; i++) {
        var row = js.dom.createElement('div.mm_item');
        var cbox = js.dom.createElement('input', {
          type: 'checkbox',
          name: 'extmods',
          value: module.uid
        });
        if (module.enabled) {
          js.dom.addClassName(row, 'enabled');
          js.dom.setAttribute(cbox, 'checked', 'checked');
        }
        js.dom.addEventListener(cbox, 'change', this.onChange, this, [row]);
        divItems.appendChild(js.dom.createElement(row, [
          cbox,
          'img.icon', {src: module.icon},
          'span.title=' + (module.title || module.name),
          'span.desc= (' + module.desc + ')'
        ]));
      }
    }
    this.divExtList.appendChild(js.dom.createElement('div.btns', ['button=Save Changes', {
      onclick: [this.onSave, this]
    }]));
    this.main.appendChild(this.divExtList);
    return this;
  };

  Proto.onChange = function (event, row) {
    var cbox = js.dom.getEventTarget(event);
    if (js.dom.getValue(cbox)) {
      js.dom.addClassName(row, 'enabled');
    } else {
      js.dom.removeClassName(row, 'enabled');
    }
  };

  Proto.onSave = function (event) {
    var values = js.dom.getValues(this.divExtList);
    var req = new js.lsn.Request('[#`./module.pm/save`]');
    req.addEventListener('onComplete', this.onSaveComplete, this);
    req.submit(values);
  };

  Proto.onSaveComplete = function (req) {
    var status = req.xhr.status;
    if (req.xhr.status && req.xhr.status == 200) {
      if (parent.js.lsn.desktop) {
        var tab = parent.js.lsn.desktop.getTab('desktop');
        tab.reload();
      }
      this.main.alert('Saved.');
    } else {
      alert(req.xhr.statusText);
    }
  };

});
