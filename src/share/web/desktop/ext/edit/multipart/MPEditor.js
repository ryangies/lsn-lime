js.extend('lsn.ext.edit', function (js) {

  this.MPEditor = function (widget, ui) {
    this.hub = widget.params.hub;
    this.addr = widget.params.node.addr;
    this.view = undefined;
    this.dv = new js.lsn.ext.edit.MPDataView(ui.data);
    this.cv = new js.lsn.ext.edit.MPContentView(ui.content);
    this.hub.addListener(this.respond, this);
  };

  this.MPEditor.prototype = {

    destroy: function () {
    },

    respond: function (action, node, bModified) {
      if (!this.view) return;
      if (node.addr.indexOf(this.addr) != 0) return;
      if (node.addr != this.addr) node = this.hub.get(this.addr);
      switch (action) {
        case 'removed':
          this.view.clear();
          break;
        case 'stored':
        case 'fetched':
          this.dv.refresh(node, bModified);
          this.cv.refresh(node, bModified);
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
      this._populate(this.node, this.ce, this.node.type == 'data-array');
    },

    getValue: function () {
      /*
      for (var i = 0; i < this.rtes.length; i++) {
        //var ne = this.rtes[i].ne;
        //var node = this.rtes[i].node;
        //var inst = ne.instanceById(node.addr);
        //if (inst) node.content = inst.getContent();
        var node = this.rtes[i].node;
        var fck = this.rtes[i].fck;
        var inst = FCKeditorAPI.GetInstance(node.addr) ;
        node.content = inst.GetXHTML();
      }
      */
      return this.node;
    },

    _populate: function (node, ce, bNoLabel) {
      if (node.ccd) {
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
          if (v.type == 'data-hash' || v.type == 'data-array') {
            if (lbl) wrap.appendChild(js.dom.createElement('br',{'class':'clear'}));
            this._populate(v, wrap, v.type == 'data-array');
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
        for (var i = 0; i < ctrls.length; i++) {
          var psib = ctrls[i].previousSibling;
          var rt = js.dom.getRight(psib);
          var width = layout.dims.w1 - 30 - rt;
          js.dom.setStyle(ctrls[i], 'width', width + 'px');
          if (js.dom.getStyle(psib, 'float') == 'left') {
            var ml = js.dom.getWidth(psib);
            ml += js.util.asInt(js.dom.getStyle(psib, 'margin-right'));
            js.dom.setStyle(ctrls[i], 'margin-left', ml + 'px');
          }
        }
      } else {
        ce.appendChild(this._createControl(node.addr, node));
      }
    },

    _createWrap: function (key, node) {
      var parts = node.type.split('-');
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
      var parts = node.type.split('-');
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
          /*
          ctrl.appendChild(this._createTextarea(node));
          var ne = new nicEditor({fullPanel:true}).panelInstance(node.addr);
          this.rtes.push({node: node, ne: ne});
          */
          //ctrl.appendChild(this._createFCKEditor(node));
          //ctrl.appendChild(this._createTextarea(node));
          ctrl.appendChild(this._createIFrame(node));
          break;
        default:
          ctrl.appendChild(this._createInput(node));
      }
      return ctrl;
    },

    _createFCKEditor: function (node) {
      var fck = new FCKeditor(node.addr);
      this.rtes.push({node: node, fck: fck});
      fck.BasePath = '[#`../fckeditor`]/';
      fck.Config['CustomConfigurationsPath'] = '[#`./fckconfig.js`]';
      fck.ToolbarSet = node.type;
      fck.Value = node.content;
      return js.dom.createElement('div', {
        id:node.addr,
        innerHTML:fck.CreateHtml()
      });
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
          id:node.addr,
          frameborder:0,
          onLoad:[function (event, node) {
            var iframe = js.dom.getElement(node.addr);
            var doc = js.dom.getContentDocument(node.addr);
            var win = js.dom.getContentWindow(node.addr);
            doc.body.contentEditable = true;
            doc.designMode = 'on';
            doc.open('text/html');
            try {doc.write(node.content)} catch (ex) {}
            doc.close();
            new js.lsn.ext.edit.ContentEditor().attach(iframe);
          }, this, [node]]
        }
      ]);
    },

    //javascript:document.body.contentEditable='true'; document.designMode='on';

    _createTextarea: function (node) {
      return js.dom.createElement('textarea', {
        id:node.addr,
        onChange:[function (event) {node.content = js.dom.getEventTarget(event).value;}, this],
        value:node.content
      });
    },

    _createInput: function (node) {
      return js.dom.createElement('input', {
        onChange:[function (event) {node.content = js.dom.getEventTarget(event).value;}, this],
        value:node.content
      });
    }

  });

  /** Content view */

  this.MPContentView = function (ce) {
    MPView.call(this, ce);
  }

  this.MPContentView.prototype = js.util.overlay(js.lang.createMethods(MPView), {

    populate: function () {
      this.ce.value = this.node.content;
    },

    getValue: function () {
      return this.ce.value;
    }

  });

});
