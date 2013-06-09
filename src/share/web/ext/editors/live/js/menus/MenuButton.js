js.extend('lsn.ext.dde', function (js) {

  this.MenuButton = js.lang.createConstructor();

  this.MenuButton.prototype = {

    construct: function (dde, props) {
      this.dde = dde;
      this.props = props;
      this.on = false;
      if (props.label) {
        this.elem = js.dom.createElement('#text', {
          'nodeValue': props.label
        });
      } else if (props.elem) {
        this.elem = js.dom.getElement(props.elem);
      } else if (props.cmd) {
        var className = props['class'];
        if (!className) className = 'button';
        var onClick = props.target && props.target == 'editor'
          ? function (event) {
            js.dom.stopEvent(event);
            if (dde.editor) dde.editor.exec(props.cmd);
            if (dde.editor) dde.editor.focus();
          }
          : function (event) {
            js.dom.stopEvent(event);
            dde.exec(props.cmd);
          };
        var stopEvent = function (event) {
          js.dom.stopEvent(event);
        };
        this.elem = js.dom.createElement('img', {
          'class': className,
          'src': props.icon,
          'alt': props.alt,
          'title': props.alt,
          'onClick': onClick,
          'onFocus': stopEvent,
          'onMouseDown': stopEvent,
          'onMouseUp': stopEvent,
          'style': {'cursor':'pointer'}
        });
      } else if (props.icon) {
        this.elem = js.dom.createElement('img', {
          'class': 'static',
          'src': props.icon,
          'alt': props.alt
        });
      }
      if (props.obj) {
        var klass = js.util.evar(props.obj);
        if (!klass) throw 'Undefined button object: ' + props.obj;
        this.obj = new klass(this, this.elem);
        this.elem = this.obj.getElement();
      }
    },

    getElement: function () {
      return this.elem;
    },

    onShow: function (args) {
      if (this.obj) this.obj.onShow(args);
      if (this.props.state) this.setState(args);
    },

    setState: function (args) {
      var elem = args[0];
      var stack = args[1];
      var cmd = args[2];
      if (cmd && cmd == this.props.cmd) {
        this.on = !this.on;
      } else {
        var state = this.props.state;
        this.on = js.util.grep(function (node) {
          return node.tagName == state;
        }, stack);
      }
      if (this.on) {
        js.dom.addClassName(this.elem, 'on');
      } else {
        js.dom.removeClassName(this.elem, 'on');
      }
    }

  };

});
