js.extend('lsn.hashtable.view', function (js) {

  var CView = js.lsn.hashtable.view.View;

  this.ListView = function () {
    CView.apply(this, arguments);
  };

  var ListView =
  this.ListView.prototype = js.lang.createMethods(CView);

  ListView.addItem = function (node) {
    var item = new js.lsn.hashtable.view.ListItem(this.app, node);
    item.addActionListener('click', this.onItemClick, this);
    this.app.ui.listView.appendChild(item.getRootElement());
  };

  ListView.onItemClick = function (action, item) {
    this.executeAction('select', item);
  };

});
