ECMAScript.Extend('lsn.ext.dde', function (ecma) {

  this.MenuButton = ecma.lang.createConstructor();

  this.MenuButton.prototype = {

    construct: function (dde, props) {
      this.dde = dde;
      this.props = props;
      this.on = false;
      if (props.label) {
        this.elem = ecma.dom.createElement('#text', {
          'nodeValue': props.label
        });
      } else if (props.elem) {
        this.elem = ecma.dom.getElement(props.elem);
      } else if (props.cmd) {
        var className = props['class'];
        if (!className) className = 'button';
        var onClick = props.target && props.target == 'editor'
          ? function (event) {
            ecma.dom.stopEvent(event);
            if (dde.editor) dde.editor.exec(props.cmd);
            if (dde.editor) dde.editor.focus();
          }
          : function (event) {
            ecma.dom.stopEvent(event);
            dde.exec(props.cmd);
          };
        var stopEvent = function (event) {
          ecma.dom.stopEvent(event);
        };
        this.elem = ecma.dom.createElement('img', {
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
        this.elem = ecma.dom.createElement('img', {
          'class': 'static',
          'src': props.icon,
          'alt': props.alt
        });
      }
      if (props.obj) {
        var klass = ecma.util.evar(props.obj);
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
        this.on = ecma.util.grep(function (node) {
          return node.tagName == state;
        }, stack);
      }
      if (this.on) {
        ecma.dom.addClassName(this.elem, 'on');
      } else {
        ecma.dom.removeClassName(this.elem, 'on');
      }
    }

  };

});
