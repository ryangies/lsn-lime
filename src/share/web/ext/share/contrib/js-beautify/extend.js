js.extend('ext.share.contrib', function (js) {
  {#./beautify-css.js}
  this.beautifyCSS = css_beautify;
});

js.extend('ext.share.contrib', function (js) {
  {#./beautify-html.js}
  this.beautifyHTML = style_html;
});

js.extend('ext.share.contrib', function (js) {
  {#./beautify.js}
  this.beautifyJS = js_beautify;
});
