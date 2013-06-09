js.extend('lsn.ext.edit', function (js) {

  this.MPEditor = function (node, ui) {
    this.hub = js.hubb.getInstance();
    this.addr = node.getAddress();
    this.view = undefined;
    this.dv = new js.lsn.ext.edit.MPDataView(ui.data);
    this.cv = new js.lsn.ext.edit.MPContentView(ui.content);

    this.hub.addActionListener('fetch', this.respond, this);
    this.hub.addActionListener('create', this.respond, this);
    this.hub.addActionListener('remove', this.respond, this);
    this.hub.addActionListener('change', this.respond, this);
    this.hub.addActionListener('update', this.respond, this);
    this.hub.addActionListener('store', this.respond, this);
    this.hub.addActionListener('replace', this.respond, this);

  };

  this.MPEditor.prototype = {

    destroy: function () {
    },

    respond: function (action, node) {
      if (!this.view) return;
      if (node.getAddress().indexOf(this.addr) != 0) return;
      if (node.getAddress() != this.addr) node = this.hub.get(this.addr);
      switch (action.name) {
        case 'remove':
          this.view.clear();
          break;
        case 'store':
        case 'fetch':
          this.dv.refresh(node, true);
          this.cv.refresh(node, true);
          break;
      }
    },

    editData: function () {
      this.cv.hide();
      this.dv.show();
      this.view = this.dv;
      this.hub.fetch(this.addr);
    },

    editContent: function () {
      this.dv.hide();
      this.cv.show();
      this.view = this.cv;
      this.hub.fetch(this.addr);
    },

    save: function () {
      this.hub.store(this.addr, this.view.getValue());
    },

    clear: function () {
      this.dv.clear();
      this.cv.clear();
    }

  };

  /** View base class */

  function MPView (ce) {
    this.hasPopulated = false;
    this.node = undefined;
    this.ce = ce;
  };

  MPView.prototype = {

    hide: function () {
      js.dom.setStyle(this.ce, 'visibility', 'hidden');
    },

    show: function () {
      js.dom.setStyle(this.ce, 'visibility', 'visible');
    },

    refresh: function (node, bModified) {
      if (!bModified && this.hasPopulated) return;
      this.clear();
      this.node = (node);
      this.populate();
      this.hasPopulated = true;
    },

    getValue: function () {
      throw 'Virtual base method "getValue" must be overridden';
    },

    clear: function () {
      js.dom.removeChildren(this.ce);
      this.node = undefined;
      this.hasPopulated = false;
    }

  };

  /** Data view */

  this.MPDataView = function (ce) {
    MPView.call(this, ce);
    this.rtes = [];
  };

  this.MPDataView.prototype = js.util.overlay(js.lang.createMethods(MPView), {

    populate: function () {
      this._populate(this.node, this.ce, this.node.getType() == 'data-array');
    },

    getValue: function () {
      return this.node;
    },

    _populate: function (node, ce, bNoLabel) {
      if (node.isDataContainer()) {
        var lbls = [];
        var ctrls = [];
        node.iterate(function (k, v) {
          var wrap = this._createWrap(k, v);
          ce.appendChild(wrap);
          var lbl = undefined;
          if (!bNoLabel) {
            lbl = this._createLabel(k, v);
            wrap.appendChild(lbl);
          }
          if (v.getType() == 'data-hash' || v.getType() == 'data-array') {
            if (lbl) wrap.appendChild(js.dom.createElement('br',{'class':'clear'}));
            this._populate(v, wrap, v.getType() == 'data-array');
          } else {
            if (lbl) lbls.push(lbl);
            var ctrl = this._createControl(k, v);
            wrap.appendChild(ctrl);
            ctrls.push(ctrl);
          }
        }, this);
        // fixed-width labels
        var width = 0;
        for (var i = 0; i < lbls.length; i++) {
          width = Math.max(width, js.dom.getWidth(lbls[i].firstChild));
        }
        for (var i = 0; i < lbls.length; i++) {
          js.dom.setStyle(lbls[i], 'width', width +'px');
        }
        // fixed-width (input|textarea) controls
        var vp = js.dom.getViewportPosition();
        for (var i = 0; i < ctrls.length; i++) {
          var psib = ctrls[i].previousSibling;
          var rt = js.dom.getRight(psib);
          var width = vp.width - 30 - rt;
          js.dom.setStyle(ctrls[i], 'width', width + 'px');
          if (js.dom.getStyle(psib, 'float') == 'left') {
            var ml = js.dom.getWidth(psib);
            ml += js.util.asInt(js.dom.getStyle(psib, 'margin-right'));
            js.dom.setStyle(ctrls[i], 'margin-left', ml + 'px');
          }
        }
      } else {
        ce.appendChild(this._createControl(node.getAddress(), node));
      }
    },

    _createWrap: function (key, node) {
      var parts = node.getType().split('-');
      var dtype = parts.length > 2 ? parts.pop() : undefined;
      var type = parts[0] + '-' + parts[1];
      return js.dom.createElement('div', {'class':'wrap'}, [
        'img', {'class':'beg', src: '/res/icons/16x16/nodes/mpe-' + type + '.png'},
        'img', {'class':'end', src: '/res/icons/16x16/nodes/mpe-end.png'}
      ]);
    },

    _createLabel: function (key, node) {
      return js.dom.createElement('div', {'class':'lbl'},
        ['span', {innerHTML: key}]);
    },

    _createControl: function (key, node) {
      var parts = node.getType().split('-');
      var dtype = parts.length > 2 ? parts.pop() : undefined;
      var type = parts[0] + '-' + parts[1];
      var ctrl = js.dom.createElement('div', {'class':'ctrl'});
      switch (dtype) {
        case 'img':
          ctrl.appendChild(this._createInput(node));
          break;
        case 'txt':
          ctrl.appendChild(this._createTextarea(node));
          break;
        case 'html':
          ctrl.appendChild(this._createIFrame(node));
          break;
        default:
          ctrl.appendChild(this._createInput(node));
      }
      return ctrl;
    },

    _createIFrame: function (node) {
      return js.dom.createElement('div', {}, [
        'div', {
          'class': 'tb',
          /*
          'innerHTML': '<b>Bold</b> | <i>Italic</i> | <u>Underline</u> | ' +
            '<s>Strike through</s> | <sup>Superscript</sup> | <sub>Subscript</sub> | ' +
            'Font Size'
          */
          /* duplicates: del, em, code, kbd
           * omit: sub (same as 'small'?)
           * omit: tt (hard tell)
          */
          'innerHTML': '<big>Abc</big> | <b>Abc</b> | <i>Abc</i> | <u>Abc</u> | <s>Abc</s> | ' +
            '<sup>Abc</sup> | <small>Abc</small>'
        },
        'iframe', {
          id:node.getAddress(),
          frameborder:0,
          onLoad:[function (event, node) {
            var iframe = js.dom.getElement(node.getAddress());
            var doc = js.dom.getContentDocument(node.getAddress());
            var win = js.dom.getContentWindow(node.getAddress());
            doc.body.contentEditable = true;
            doc.designMode = 'on';
            doc.open('text/html');
            try {doc.write(node.getValue())} catch (ex) {}
            doc.close();
            new js.lsn.ext.edit.ContentEditor().attach(iframe);
          }, this, [node]]
        }
      ]);
    },

    //javascript:document.body.contentEditable='true'; document.designMode='on';

    _createTextarea: function (node) {
      return js.dom.createElement('textarea', {
        id:node.getAddress(),
        onChange:[function (event) {node.setValue(js.dom.getEventTarget(event).value);}, this],
        value:node.getValue()
      });
    },

    _createInput: function (node) {
      return js.dom.createElement('input', {
        onChange:[function (event) {node.setValue(js.dom.getEventTarget(event).value);}, this],
        value:node.getValue()
      });
    }

  });

  /** Content view */

  this.MPContentView = function (ce) {
    MPView.call(this, ce);
  }

  this.MPContentView.prototype = js.util.overlay(js.lang.createMethods(MPView), {

    populate: function () {
      this.ce.value = this.node.getContent();
    },

    getValue: function () {
      return this.ce.value;
    }

  });

});
