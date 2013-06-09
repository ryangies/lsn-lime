[#:use ./browse.hf]
[#:comment]/*

  These CSS class names (variable names under layout.dims) are updated when the 
  window is loaded and resized:

   _______ _________________________   _      _     _      _
  |       |_________________________|  _| h2a  | h2  | h1b  | h1
  |       |                         |   | h2b  |     |      |
  |       | [ w2 x h2b            ] |   |      |     |      |
  |       |                         |  _|     _|     |      |
  |=================================|         _| h3  |      |
  |                                 |          | h1a |      |
  |---------------------------------|         _|     |      |
  |                                 |  _       | h4  |      |
  | [ w1c x h4a                   ] |   | h4a  |     |      |
  | [                             ] |  _|      |     |      |
  |_________________________________|         _|    _|     _|

            |_____________________|  
            w2

    |_____________________________|
    w1c

  |_______|_________________________|
  w1a      w1b

  |_________________________________|
  w1

  ea1 = w1b x h4
  ea2 = w2 x h4a
  ea2 = w2 x h4

*/[#:end comment]

js.extend('local', function () {

  // Page layout (dimensions) which updates on resize
  this.layout = new js.lsn.PageLayout({

    dims: {
      htop: 0,
      ratio: 0,
      hpad: [#area-hpad],
      vpad: [#area-vpad],
      w1: 0,
      w1a: 0,
      w1b: 0,
      w1c: 0,
      w2: 0,
      h1: 0,
      h1a: 0,
      h1b: 0,
      h2: 0,
      h2a: 0,
      h2b: 0,
      h3: 0,
      h4: 0,
      h4a: 0
    },

    load: function () {
      var vp = js.dom.getViewportPosition();
      var h1 = js.util.asInt(Math.max(vp.height/2.5, [#topmin]));
      this.dims.ratio = (h1/vp.height).toFixed(2);
      this.resize();
    },

    resize: function () {
      var vp = js.dom.getViewportPosition();
      this.dims.htop = js.util.asInt(Math.max(vp.height * this.dims.ratio, [#topmin]));
      // Widths
      this.dims.w1 = vp.width;
      this.dims.w1a = [#sidebar-width];
      this.dims.w1b = this.dims.w1 - this.dims.w1a;
      this.dims.w1c = this.dims.w1 - (2*this.dims.hpad);
      this.dims.w2 = this.dims.w1b - (2*this.dims.hpad);
      // Heights
      this.dims.h1 = vp.height;
      this.dims.h1a = [#title-height];
      this.dims.h1b = this.dims.h1 - this.dims.h1a;
      this.dims.h2 = this.dims.htop - this.dims.h1a;
      this.dims.h2a = [#treetop-height];
      this.dims.h2b = this.dims.h2 - this.dims.h2a - (2*this.dims.vpad);
      this.dims.h3 = [#resize-height];
      this.dims.h4 = this.dims.h1b - this.dims.h2 - this.dims.h3;
      this.dims.h4a = this.dims.h4 - (2*this.dims.vpad);
      // Update CSS
      this.css.updateRule('.w1',  {width:  js.util.asInt(this.dims.w1,  true) + 'px'});
      this.css.updateRule('.w1a', {width:  js.util.asInt(this.dims.w1a, true) + 'px'});
      this.css.updateRule('.w1b', {width:  js.util.asInt(this.dims.w1b, true) + 'px'});
      this.css.updateRule('.w1c', {width:  js.util.asInt(this.dims.w1c, true) + 'px'});
      this.css.updateRule('.w2',  {width:  js.util.asInt(this.dims.w2,  true) + 'px'});
      this.css.updateRule('.h1',  {height: js.util.asInt(this.dims.h1,  true) + 'px'});
      this.css.updateRule('.h1a', {height: js.util.asInt(this.dims.h1a, true) + 'px'});
      this.css.updateRule('.h1b', {height: js.util.asInt(this.dims.h1b, true) + 'px'});
      this.css.updateRule('.h2',  {height: js.util.asInt(this.dims.h2,  true) + 'px'});
      this.css.updateRule('.h2a', {height: js.util.asInt(this.dims.h2a, true) + 'px'});
      this.css.updateRule('.h2b', {height: js.util.asInt(this.dims.h2b, true) + 'px'});
      this.css.updateRule('.h3',  {height: js.util.asInt(this.dims.h3,  true) + 'px'});
      this.css.updateRule('.h4',  {height: js.util.asInt(this.dims.h4,  true) + 'px'});
      this.css.updateRule('.h4a', {height: js.util.asInt(this.dims.h4a, true) + 'px'});
      // Full edit-area width/height
      this.css.updateRule('.ea1', {
        width:  js.util.asInt(this.dims.w1b, true) + 'px',
        height: js.util.asInt(this.dims.h4,  true) + 'px'
      });
      // Edit area with vert & horiz spacing
      this.css.updateRule('.ea2', {
        width:  js.util.asInt(this.dims.w2,  true) + 'px',
        height: js.util.asInt(this.dims.h4a, true) + 'px'
      });
      // Edit area with horiz spacing only
      this.css.updateRule('.ea3', {
        width:  js.util.asInt(this.dims.w2,  true) + 'px',
        height: js.util.asInt(this.dims.h4, true) + 'px'
      });
    }

  });

  this.layout.css = new js.dom.StyleSheet();

});
