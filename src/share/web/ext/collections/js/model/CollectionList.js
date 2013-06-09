/** @namespace {#namespace} */
js.extend('{#namespace}.model', function (js) {

  var _package = this;
  var CNode = _package.Node;

  _package.CollectionList = function () {
    CNode.apply(this, arguments);
    this.schema = env.schemas.fetch("collection-list");
  };

  var _proto = _package.CollectionList.prototype = js.lang.createMethods(
    CNode
  );

  _proto.populate = function () {
    this.target = this.data.getValue('items');
    this.target.addActionListener('*', this.onDataAction, this);
    this.populateValues(this.target);
  };

  _proto.canExpand = function () {
    return true;
  };

  _proto.createNode = function (data) {
    var ctor = js.{#namespace}.model.factory.get('collection');
    return new ctor(data, this.tree);
  };

  _proto.getAppendage = function () {
    return this.getDataNode().getValue('items');
  };

  _proto.getAvailableChildSchemas = function () {
    return [env.schemas.fetch('collection-definition')];
  };

  _proto.getType = function () {
    return 'collection-list';
  };

});
