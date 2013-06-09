/** @namespace lsn.desktop */
ECMAScript.Extend('lsn.desktop', function (ecma) {

  var baseClass = ecma.lsn.Widget;
  var proto = ecma.lang.createMethods(baseClass);

  this.Editor = function (uri, props, ui) {
    baseClass.call(this, uri, props);
    this.props.ui = ui;
    this.addEvent('show', this.showMenu);
  };

  this.Editor.prototype = proto;

  proto.showMenu = function () {
    var ui = this.props.ui.menu;
    var content = this.request.xhr.responseHash.get('head/menu');
    if (content) {
      ecma.dom.setAttribute(ui, 'innerHTML', content);
    }
  };

});
