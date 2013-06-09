/** @namespace ext.share.filesystem.input.editors */
js.extend('ext.share.filesystem.input.editors', function (js) {

  var _package = this;
  var CImageItem = _package.ImageItem;
  var CHandlerPool = js.action.HandlerPool;
  var _defaultCss = null;

  function _initDefaultStyles () {
    if (_defaultCss) return;
    _defaultCss = new js.dom.StyleSheet({'position':'first'});
    _defaultCss.createRulesFromData({#:json default-styles});
  }

  _package.ImageList = function () {
    CHandlerPool.call(this, env); // Defer to `env` handlers
//  _initDefaultStyles();
    this.listView = new js.ext.share.data.view.ListView();
    this.listView.setLayerName('image-list');
    this.listView.setItemClass(CImageItem);
    this.listMenu = new js.ext.share.ui.menu.PanelMenu(this);
    this.listMenu.load({#:json list-menu});
    this.captionEditor = new js.ext.share.filesystem.input.editors.ImageCaption();
  };

  var _proto
    = _package.ImageList.prototype
    = js.lang.createPrototype(
      CHandlerPool
    );

  _proto.load = function (dnode) {
    var mnode = this.listView.load(dnode);
    this.listMenu.setSelector(mnode);
    this.captionEditor.setSelector(mnode);
  };

  _proto.unload = function () {
    this.captionEditor.clearListeners();
  };

  _proto.getMenuElements = function () {
    return this.listMenu.getElements();
  };

  _proto.getElements = function () {
    return this.listView.getElements().concat(this.captionEditor.getElements());
  };

});
__DATA__
list-menu => %{
  items => @{

    %{
      type => item
      text => Add Image
      tooltip => Add an image to this list
      action => add-image
      icon => /res/icons/16x16/nodes/file-png.png
    }

    %{
      type => item
      target => selection
      text => Delete
      tooltip => Delete an image from the list
      action => delete-image
      icon => /res/icons/16x16/actions/edit-delete2.png
    }

      %{
        type => item
        text => Move left
        target => selection
        tooltip => Change the order in which this item appears
        action => data-reorder-previous
        icon => /res/icons/16x16/actions/arrowLeft.png
        matchTypes => @{
          ^data-
        }
      }

      %{
        type => item
        text => Move right
        target => selection
        tooltip => Change the order in which this item appears
        action => data-reorder-next
        icon => /res/icons/16x16/actions/arrowRight.png
        matchTypes => @{
          ^data-
        }
      }

  }
}
default-styles => @{
  %{
    selector => .list-view.image-list
    rule => %{
      height => 80px
    }
  }
  %{
    selector => img.image-list.image-item
    rule => %{
      border => 2px solid transparent
    }
  }
  %{
    selector => img.image-list.image-item.selected
    rule => %{
      border => 2px dotted red
    }
  }
}
