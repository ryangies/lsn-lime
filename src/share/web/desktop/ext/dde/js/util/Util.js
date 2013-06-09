ECMAScript.Extend('lsn.ext.dde', function (ecma) {
  
  this.parseAttributes = function (str) {
    var attrs = new ecma.data.HashList();
    if (!str) str = new String();
    var parts = str.split(';');
    for (var j = 0, part; part = parts[j]; j++) {
      if (!part) continue;
      var kv = part.split('=');
      var key = kv[0];
      var val = kv[1].replace(/^'|'$/g, '');
      attrs.set(key, val);
    }
    return attrs;
  };


});
