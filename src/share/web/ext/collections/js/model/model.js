/** @namespace {#namespace} */
js.extend('{#namespace}.model', function (js) {

  var _package = this;

  _package.factory = new js.ext.share.ObjectFactory();
  _package.factory.set('collections',     js.{#namespace}.model.CollectionList);
  _package.factory.set('collection-list', js.{#namespace}.model.CollectionList);
  _package.factory.set('collection',      js.{#namespace}.model.CollectionDefinition);
  _package.factory.set('collection-definition', js.{#namespace}.model.CollectionDefinition);
//_package.factory.set('category',        js.{#namespace}.model.CategoryNode);
  _package.factory.set('item',            js.{#namespace}.model.ItemNode);


  env.schemas.load(js.data.fromObject({#:json "./schema.hf"}));

});
