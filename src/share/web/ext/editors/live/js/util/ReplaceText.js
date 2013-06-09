js.extend('lsn.ext.dde', function (js) {

  var URL_ELEMS = {
    'A': ['href'],
    'IMG': ['src'],
    'OBJECT': ['src']
   };

  this.ReplaceText = function (substr, newSubstr) {
    this.substr = substr;
    this.newSubstr = newSubstr;
  };

  var _proto = this.ReplaceText.prototype = js.lang.createMethods();

  _proto.perform = function (elem, scope) {
    if (!this.substr) return;
    var bURLs = scope ? scope == 'urls' || scope == 'both' : false;
    var bText = scope ? scope == 'both' || scope == 'text' : true;
    var node = elem.firstChild;
    while (node) {
      var next = node.nextSibling;
      switch (node.nodeType) {
        case js.dom.constants.ELEMENT_NODE:
          if (bURLs && URL_ELEMS[node.tagName]) {
            for (var i = 0, attr; attr = URL_ELEMS[node.tagName][i]; i++) {
              var attrValue = js.dom.getAttribute(node, attr);
              if (attrValue && typeof(attrValue.replace == 'function')) {
                js.dom.setAttribute(node, attr,
                  attrValue.replace(this.substr, this.newSubstr));
              }
            }
          }
          this.perform(node, scope); // recurse
          break;
        case js.dom.constants.TEXT_NODE:
          if (bText) {
            node.nodeValue = node.nodeValue.replace(this.substr, this.newSubstr);
          }
        default:
          break;
      }
      node = next;
    }
    return elem;
  };

});
