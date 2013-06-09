/** @namespace ext.share.ui.menu */
js.extend('ext.share.ui.menu', function (js) {

  var Package = this;

  /**
   * @class ActionNode
   */

  Package.ActionNode = function CActionNode (data, context, selector) {
    Package.PanelNode.apply(this, arguments);
  };

  var ActionNode = Package.ActionNode.prototype = js.lang.createMethods(
    Package.PanelNode
  );

  ActionNode.createUI = function () {
    var innerElements = [];
    if (this.data.icon) {
      innerElements.push(js.dom.createElement('IMG.icon', {
        'src': this.data.icon,
        'width': '16',
        'height': '16'
      }));
    }
    innerElements.push(js.dom.createElement('SPAN', {
      'innerHTML': this.data.text
    }));
    this.li = js.dom.createElement('LI', ['A.action', {
      'onClick': [this.onItemClick, this],
      'title': this.data.tooltip || ''
    }, innerElements
    ]);
  };

  ActionNode.getElements = function () {
    return [this.li];
  };

  ActionNode.getAppendage = function () {
    return this.li;
  };

  ActionNode.canDisplay = function (node) {
    try {
      if (js.util.isFunction(this.data.match)) {
        return this.data.match(node);
      } else if (js.util.defined(this.data.matchTypes)) {
        var type = node.getType().toString();
        var matchTypes = this.data.matchTypes || [];
        var ok = false;
        for (var i = 0; !ok && i < matchTypes.length; i++) {
          ok = type.match(matchTypes[i]);
        }
        return ok ? true : false;
      } else {
        return true;
      }
    } catch (ex) {
      return false;
    }
  };

  ActionNode.onItemClick = function (event) {
    js.dom.stopEvent(event);
    this.context.invokeHandler(this.getAction(), this.getActionTarget(), event);
    this.dispatchAction('onClick', this);
  };

  ActionNode.getAction = function () {
    var parts = this.data.action.split(':', 1);
    return parts[0];
  };

  ActionNode.getActionTarget = function () {
    if (this.selector) {
      var node = this;
      var target;
      while (!target && node && node !== this.rootNode) {
        target = node.data.target;
        node = node.parentNode;
      }
      if (target == 'cwd') {
        return this.selector.getCwd()
      } else if (target == 'selection') {
        return this.selector.getSelected();
      }
    }
    // Default uses a parameter provided in the action string. This happens
    // when there is no selector object provided, or the action item and its
    // parent categories don't define a target.
    var i = this.data.action.indexOf(':');
    var param = i < 0 ? null : this.data.action.substr(i + 1);
    return param;
  };

});
