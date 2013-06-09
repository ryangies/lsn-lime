/** @namespace lsn.desktop */
ECMAScript.Extend('lsn.desktop', function (ecma) {

  var baseClass = ecma.lsn.ui.Element;
  var proto = ecma.lang.createMethods(baseClass);

  this.Application = function () {
    baseClass.call(this);
  };

  this.Application.prototype = proto;

  proto.getRootElement = function () {
    return this.getElement('div_page');
  };

  proto.createUI = function () {
    this.createElement('div_page', [
      this.createElement('div_head'),
      this.createElement('div_body'),
      this.createElement('div_foot')
    ]);
    ecma.dom.addClassName(this.getElement('div_page'), 'pgRoot');
    ecma.dom.addClassName(this.getElement('div_head'), 'pgHead');
    ecma.dom.addClassName(this.getElement('div_body'), 'pgBody');
    ecma.dom.addClassName(this.getElement('div_foot'), 'pgFoot');
    return this;
  };

  proto.alert = function (msg) {
    ecma.window.alert(msg);
  };

  proto.setStatus = function (msg, interval) {
  };

});
