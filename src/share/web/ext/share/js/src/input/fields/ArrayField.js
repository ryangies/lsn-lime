/** @namespace ext.share.input.fields */
js.extend('ext.share.input.fields', function (js) {

  var _package = this;
  var CFormField = js.ext.share.input.fields.FormField;

  _package.ArrayField = function (data) {
    this.uiRoot = js.dom.createElement('DIV');
    this.uiMenu = js.dom.createElement('DIV');
    CFormField.apply(this, [data]);
  };

  var _proto = _package.ArrayField.prototype = js.lang.createMethods(
    CFormField
  );

  js.ext.share.input.fields.factory.set('array', _package.ArrayField);

  _proto.onAdopted = function () {
    if (!this.childNodes) {
      this.appendChildren(this.data.fields);
    }
  };

  _proto.getElements = function () {
    return [this.uiRoot];
  };

  _proto.isHidden = function () {
    return false;
  };

  _proto.focus = function () {
  };

  _proto.select = function () {
  };

  _proto.getMenuElements = function () {
    return [this.uiMenu];
  };

  _proto.tieValue = function (dnode, key, bAutoCommit) {
    // bAutoCommit is implicitly true
    var storedValue = dnode.getValue(key);
    if (!storedValue) {
      js.dom.replaceChildren(this.uiRoot, js.dom.createElements(
        'P.error=Missing storage'
      ));
      return;
      /** Need to store/callback then proceed to vifify
       *
      storedValue = new js.hubb.ArrayNode();
      storedValue.setAttribute('addr', dnode.getAddress() + '/' + key);
      storedValue.setAttribute('type', 'data-array');
      storedValue.setAttribute('mtime', 0);
      dnode.setValue(key, storedValue);
      */
    }
    var id = dnode.getAddress();
    var schema = env.schemas.fetch(this.data.schema);
    this.editor = new js.ext.collections.Editor(id);
    this.editor.loadDataAndSchema(storedValue, schema);
    var selection = new js.ext.share.Selection();
    this.collMenu = new js.ext.share.ui.menu.PanelMenu(env, selection);
    this.collMenu.load({#:json collMenu});
    js.dom.replaceChildren(this.uiRoot, this.editor.getElements());
    js.dom.replaceChildren(this.uiMenu, this.collMenu.getElements());
    js.dom.appendChildren(this.uiMenu, this.editor.getMenu().getElements());
    selection.select(this.editor);
    return this.input.setValue(storedValue);
  };

});
__DATA__
collMenu => %{
  items => @{

    %{
      type => category
      items => @{

        %{
          type => item
          target => selection
          text => New Item
          tooltip => Create a new item in this collection
          action => ext-collections-new-item
          icon => /res/icons/16x16/nodes/data-hash.png
        }

      }
    }

  }
}
