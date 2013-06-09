/** @namespace ext.share.filesystem.view */
js.extend('ext.share.filesystem.view', function (js) {

  var _package = this;
  var CTreeViewLayer = js.ext.share.filesystem.view.TreeViewLayer;

  _package.SelectViewLayer = function (node, name, view) {
    CTreeViewLayer.apply(this, arguments);
    this.isActive = false;
    this.selectEvent = null;
  };

  var _proto = _package.SelectViewLayer.prototype = js.lang.createMethods(
    CTreeViewLayer
  );

  _proto.onAdopt= function (child) {
    CTreeViewLayer.prototype.onAdopt.apply(this, arguments);
    if (this.node.isExpanded) {
      child.setState('active');
      child.setExpandedState();
    }
  };

  _proto.insertUI = function () {
    if (this.nextSibling) {
      js.dom.insertBefore(this.dl, this.nextSibling.dl);
    } else if (this.previousSibling) {
      js.dom.insertAfter(this.dl, this.previousSibling.dl);
    } else {
      js.dom.appendChild(this.parentElement, this.dl);
    }
  };

  _proto.createUI = function () {

    this.parentElement = this.parentNode
      ? this.parentNode.dd
      : this.view.div;

    this.uiIcon = js.dom.createElement('IMG.icon.type', {'width':16, 'height':16});
    this.uiName = js.dom.createElement('SPAN.name');

    this.uiAnchor = js.dom.createElement('A',
      {
        'onClick': [this.onClick, this],
        'onDblClick': [this.onDblClick, this]
      },
      [this.uiIcon, this.uiName]
    );

    var childNodes = [this.uiAnchor];
    if (this.node.canCollapse()) {
      this.uiToggle = js.dom.createElement('IMG.icon.toggle', {
        'width':16,
        'height':16,
        'onClick': [this.onToggleClick, this]
      });
      childNodes.unshift(this.uiToggle);
      js.dom.addClassName(this.uiAnchor, 'with-toggle');
    }

    this.dt = js.dom.createElement('DT', childNodes);
    this.dd = js.dom.createElement('DD');
    this.dl = js.dom.createElement('DL', [this.dt, this.dd]);

    this.setState('inactive');

    if (!this.parentNode) {
      js.dom.appendChild(this.parentElement, this.dl);
    }

    this.extendUI();
    this.updateUI();

  };

  _proto.extendUI = function () {
  };

  _proto.updateUI = function () {
    var addr = this.node.getTargetAddress();
    js.dom.setValue(this.uiName, this.node.getName());
    js.dom.setAttribute(this.uiAnchor, 'href', addr);
    js.dom.setAttribute(this.uiAnchor, 'title', this.node.getCrumbPath());
    if (this.view.getParameter('showThumbnails') && addr.match(/\.(jpe?g|gif|png)$/i)) {
      js.dom.setAttribute(this.uiIcon, 'src', addr + '?resize=16x16');
    } else {
      js.dom.setAttribute(this.uiIcon, 'src', this.node.getIconPath());
    }
    this.setExpandedState();
  };

  _proto.removeUI = function () {
    js.dom.removeElement(this.dl);
  };

  _proto.onExpand = function () {
    this.show();
  };

  _proto.onCollapse = function () {
    this.setExpandedState();
    var child = this.firstChild;
    while (child) {
      child.setState('inactive');
      child = child.nextSibling;
    }
  };

  _proto.show = function () {
    this.setState('active');
    var child = this.firstChild;
    while (child) {
      child.setState('active');
      child = child.nextSibling;
    }
    if (this.parentNode) this.parentNode.show();
  };

  _proto.setState = function (state) {
    this.setExpandedState();
    switch (state) {
      case 'inactive':
        js.dom.addClassName(this.dl, 'inactive');
        this.isActive = false;
        break;
      default:
        this.isActive = true;
        js.dom.removeClassName(this.dl, 'inactive');
    }
  };

  _proto.setExpandedState = function () {
    if (this.uiToggle) {
      var iconName = this.node.canExpand() && this.node.canCollapse()
        ? this.node.isExpanded ? 'isexp.png' : 'canexp.png'
        : 'noexp.png';
      var src = js.hubb.getIconByName(iconName);
      js.dom.setAttribute(this.uiToggle, 'src', src);
    }
  };

  _proto.onClick = function (event) {
    js.dom.stopEvent(event);
    this.selectEvent = event;
    this.node.select();
  };

  _proto.onDblClick = function (event) {
    js.dom.stopEvent(event);
    this.node.toggleExpanded();
    this.node.select();
  };

  _proto.onToggleClick = function (event) {
    js.dom.stopEvent(event);
    this.node.toggleExpanded();
  };

  _proto.onSelect = function (action) {
    js.dom.addClassName(this.dt, 'selected');
    if (!this.selectEvent) js.dom.scrollTo(this.dt);
    this.selectEvent = null;
  };

  _proto.onDeselect = function (action) {
    js.dom.removeClassName(this.dt, 'selected');
  };

});
