[#:use ./browse.hf]
[#:comment]/*

  These CSS class names (variable names under layout.dims) are updated when the 
  window is loaded and resized:

   _______ _________________________  _
  |       |_________________________|  | h1
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |       |                         |  |
  |_______|_________________________| _|

  |_________________________________|
  w1
  |_______||________________________|
  w1a    w1b  w1c


*/[#:end comment]

js.extend('local', function () {

  // Page dimensions which update on resize
  this.layout = new js.lsn.PageLayout({

    dims: {
      ratio: 0,
      w1: 0,
      w1a: 0,
      w1b: 0,
      w1c: 0,
      h1: 0,
    },

    load: function () {
      this.css.updateRule('html', {margin: 0, padding: 0});
      this.css.updateRule('body', {margin: 0, padding: 0});
      var vp = js.dom.getViewportPosition();
      var w1 = js.util.asInt(Math.max(vp.width/2.5, 300));
      this.dims.ratio = (w1/vp.width).toFixed(2);
      this.resize();
    },

    resize: function () {
      var vp = js.dom.getViewportPosition();
      // Widths
      this.dims.w1 = vp.width;
      this.dims.w1a = 300;
      this.dims.w1b = 5;
      this.dims.w1c = this.dims.w1 - this.dims.w1a - 5;
      // Heights
      this.dims.h1 = vp.height;
      // Update CSS
      this.css.updateRule('.w1',  {width:  js.util.asInt(this.dims.w1,  true) + 'px'});
      this.css.updateRule('.w1a', {width:  js.util.asInt(this.dims.w1a, true) + 'px'});
      this.css.updateRule('.w1b', {width:  js.util.asInt(this.dims.w1b, true) + 'px'});
      this.css.updateRule('.w1c', {width:  js.util.asInt(this.dims.w1c, true) + 'px'});
      this.css.updateRule('.h1',  {height: js.util.asInt(this.dims.h1,  true) + 'px'});
      // Drag handle
      this.css.updateRule('#hsplit', {left:  js.util.asInt(this.dims.w1a, true) + 'px'});
    }

  });

  this.layout.css = new js.dom.StyleSheet();

});
