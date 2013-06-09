js.extend('lsn.ext.wireframe.data', function (js) {

  var CNode = this.Node;

  this.DirectiveNode = function (typeName) {
    CNode.apply(this);
    this.tagName = typeName.toUpperCase();
  };

  var _proto = this.DirectiveNode.prototype = js.lang.createMethods(CNode);

  _proto.toString = function () {
    return this.tagName;
  };

  {#:for (name) in standard}
  js.lsn.ext.wireframe.data.register('{#name}', this.DirectiveNode);
  {#:end for}

});

__DATA__

standard => @{
  comment
  into
  use
  set
  define
  exec
  dump
  unset
  if
  elsif
  else
  for
  math
  trim
  subst
}
