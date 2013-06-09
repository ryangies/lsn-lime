js.extend('local', function () {

  var _sel = null;
  var _sb = null;

  this.notify = function (text) {
    if (!_sb) _sb = new js.local.StatusBar();
    _sb.notify(text);
  }

  this.openQuickView = function (dnode) {
    if (_sel == dnode.getAddress() && js.local.viewer) return; // already open
    _sel = dnode.getAddress();
    dnode.fetch(js.local._openQuickView);
    /*
    if (dnode.hasFetched()) {
      js.local._openQuickView(dnode, true);
      dnode.fetch(js.local._refreshQuickView);
    } else {
      dnode.fetch(js.local._openQuickView);
    }
    */
  };

  this._openQuickView = function (dnode, disabled) {
    if (_sel != dnode.getAddress()) return; // another item was selected before the node was fetched
    js.local.viewer = js.local.getViewer(dnode);
    if (js.local.viewer) js.local.viewer.show(dnode, disabled);
  };

  this._refreshQuickView = function (dnode) {
    if (js.local.viewer) js.local.viewer.refresh(dnode);
  };

  this.closeQuickView = function (dnode) {
    if (js.local.viewer) js.local.viewer.hide();
    js.local.viewer = null;
  };

  var _viewerDefs = [#:json "./qview/properties.hf/viewers"];
  var _viewers = new Object(); // Viewers as singletons

  this.getViewer = function (dnode) {
    var spec = undefined;
    var type = dnode.getType();
    for (var i = 0; !spec && i < _viewerDefs.length; i++) {
      var def = _viewerDefs[i];
      var equals = def['type-equals'];
      if (js.util.defined(equals)) {
        if (type == equals) {
          spec = def;
        }
      } else {
        var match = def['type-match'];
        if (js.util.defined(match)) {
          if (type.match(match)) {
            spec = def;
          }
        }
      }
    }
    if (!spec) return;
    var url = def['widget.url'];
    if (!_viewers[url]) {
      _viewers[url] = new js.local.QuickView(url);
    }
    return _viewers[url];
  };

});

js.extend('local', function () {

  var proto = {};

  this.QuickView = function (url) {
    this.url = url;
    this.widget = new js.lsn.Widget(url, {
      'refetch': false,
      'sticky': true,
      'container': js.dom.getElement('editarea')
    });
    this.widget.addEvent('init', [this.onInit, this]);
  };

  this.QuickView.prototype = proto;

  proto.refresh = function (dnode) {
    this.widget.params = {'dnode':dnode};
    this.widget.doEvent('refresh');
    this.widget.doEvent('enable');
  };

  proto.show = function (dnode, disabled) {
    this.widget.show({'dnode':dnode, 'disabled':disabled});
  };

  proto.onInit = function () {
    if (!this.widget.request.responseHash) return;
    var content = this.widget.request.responseHash.get('head/menu');
    if (content) {
      js.dom.setValue('editmenu', content);
    }
  };

  proto.hide = function () {
    this.widget.doEvent('checkmodified');
    if (this.widget.props.isDirty && !this.widget.props.isSaving) {
      if (confirm('Save changes?')) {
        this.widget.doEvent('save');
      }
    }
    this.widget.hide();
    js.dom.removeChildren('editmenu');
  };

});

ECMAScript.Extend('local', function (ecma) {

  var proto = {};

  this.StatusBar = function (elem) {
    this.timeout = 4000;
  };

  this.StatusBar.prototype = proto;

  proto.notify = function (text) {
    var vp = js.dom.getViewportPosition();
    var msgElem = ecma.dom.createElement('span', {
      'innerHTML': text,
      'style': {'font-size':'12px'}
    });
    var pad = 12;
    var width = (text.length * 10) + (2*pad); // approx width
    var left = (vp.width/2) - (width/2);
    var wrapElem = ecma.dom.createElement('div', {
      'class': 'statusNotify',
      'style': {
        'position': 'absolute',
        'top': (vp.height/5) + 'px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    }, [msgElem]);
    ecma.dom.getBody().appendChild(wrapElem);
    ecma.dom.setStyle(msgElem, 'visibility', 'visible');
    ecma.dom.setTimeout(ecma.dom.removeElement, this.timeout, null, [wrapElem]);
  };

});
