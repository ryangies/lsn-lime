js.extend('lsn.hashtable.view', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.ListItem = function (app, node) {
    CAction.apply(this);
    this.app = app;
    this.node = node;
    this.ui = new Object();
    this.node.addActionListener('select', this.select, this);
    this.node.addActionListener('deselect', this.deselect, this);
    this.node.addActionListener('lower', this.doLower, this);
    this.node.addActionListener('raise', this.doRaise, this);
    this.node.addActionListener('change', this.doChange, this);
    this.node.addActionListener('remove', this.doRemove, this);
    this.createUI();
  };

  var ListItem =
  this.ListItem.prototype = js.lang.createMethods(CAction);

  ListItem.createUI = function () {
    this.ui.li = js.dom.createElement('LI.action', {
      'onClick': [this.onClick, this],
      'innerHTML': this.node.getDisplayName()
    });
  };

  ListItem.doChange = function (action, node) {
    js.dom.setValue(this.ui.li, node.getDisplayName());
  };

  ListItem.getRootElement = function () {
    return this.ui.li;
  };

  ListItem.getNode = function () {
    return this.node;
  };

  ListItem.onClick = function (event) {
    js.dom.stopEvent(event);
    this.executeAction('click', this);
  };

  ListItem.select = function () {
    js.dom.addClassName(this.ui.li, 'sel');
    this.scrollIntoView();
  };

  ListItem.deselect = function () {
    js.dom.removeClassName(this.ui.li, 'sel');
  };

  ListItem.doLower = function (action) {
    js.dom.insertBefore(this.ui.li, this.ui.li.previousSibling);
    this.scrollIntoView();
  };

  ListItem.doRaise = function (action) {
    js.dom.insertAfter(this.ui.li, this.ui.li.nextSibling);
    this.scrollIntoView();
  };

  ListItem.scrollIntoView = function () {
    js.dom.scrollTo(this.ui.li);
  };

  ListItem.doRemove = function () {
    js.dom.removeElement(this.ui.li);
  };

});
