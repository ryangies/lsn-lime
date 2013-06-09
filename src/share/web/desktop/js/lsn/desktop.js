/** @namespace lsn.desktop */
ECMAScript.Extend('lsn.desktop', function (ecma) {

  var _tabset = null;
  var _hub = null;

  this.init = function (tabs) {
    _tabset = new js.res.Tabset('lh-tabs', 'rh-tabs', 'workspace');
    /*
    _tabset.addActionListener('onChange', function (action, tabset) {
      _cookies.write('/desktop/tabs', tabset.tabs);
    });
    */
    if (tabs) {
      tabs.iterate(function (idx, val) {
        this.createTab(val.toObject());
      }, this);
    }
    /*
    var openTabs = _cookies.read('/desktop/tabs');
    for (var i = 0, props; props = openTabs[i]; i++) {
      _tabset.createTab(props);
    }
    */
  };

  this.createTab = function (props) {
    return _tabset.createTab(props);
  };

  this.getTab = function (name) {
    return _tabset.getTab(name);
  };

  this.browse = function (tnode, newTab) {
    var tabId = newTab
      ? typeof(newTab) === 'boolean'
        ? ecma.util.randomId('tab')
        : newTab
      : 'browse';
    var addr = tnode.data.getAddress();
    var name = ecma.data.addr_name(addr) || addr;
    var props = {
      'id': tabId,
      'src': '/desktop/ext/browse/index.html?a=' + addr,
      'icon': tnode.data.getIcon(),
      'name': name,
      'side': 'right',
      'canClose': true
    };
    var tab = this.getTab(tabId);
    if (tab) {
      try {
        tab.rename(name, tnode.data.getIcon());
        var tview = tab.getWindow().js.local.tview;
        tview.setRootAddress(addr);
        tview.select(addr);
        tab.select();
        return tab;
      } catch (ex) {
        // Punt to creating (reloading) the tab
      }
    }
    return this.createTab(props);
  };

  this.logout = function () {
    new ecma.http.Request('/res/login/module.pm/logout', {
      onSuccess: function () {window.top.location.reload()}
    }).submit();
  };

});
