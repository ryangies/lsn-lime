js.extend('lsn.ext.wireframe.elem', function (js) {

  this.HTMLElement = function (tagName) {
    this.tagName = tagName;
  };

  var HTMLElement
      = this.HTMLElement.prototype
      = js.lang.createMethods();

  HTMLElement.toString = function () {
    return this.tagName;
  };

  {#:for (name) in html4}
  js.lsn.ext.wireframe.elem.factory.register('{#name}', this.HTMLElement);
  {#:end for}

});

__DATA__

html4 => @{
  a
  abbr
  acronym
  address
  applet
  area
  b
  base
  basefont
  bdo
  big
  blockquote
  body
  br
  button
  caption
  center
  cite
  code
  col
  colgroup
  dd
  del
  dfn
  dir
  div
  dl
  dt
  em
  fieldset
  font
  form
  frame
  frameset
  h1
  h2
  h3
  h4
  h5
  h6
  head
  hr
  html
  i
  iframe
  img
  input
  ins
  isindex
  kbd
  label
  legend
  li
  link
  map
  menu
  meta
  noframes
  noscript
  object
  ol
  optgroup
  option
  p
  param
  pre
  q
  s
  samp
  script
  select
  small
  span
  strike
  strong
  style
  sub
  sup
  table
  tbody
  td
  textarea
  tfoot
  th
  thead
  title
  tr
  tt
  u
  ul
  var
}
