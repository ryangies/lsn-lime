if (false && top.ECMAScript) {
  ECMAScript = top.ECMAScript;
  js = new ECMAScript.Class(window, document);
  if (!js.util.evar('js.lsn.ext.dde')) {
    top.js.dom.include.script({'src':'[#`./dde.js`]'});
  }
} else {
  document.write('<script type="text/javascript" src="/res/js/livesite.js"></script>');
  document.write('<script type="text/javascript" src="/res/js/hub.js"></script>');
  document.write('<script type="text/javascript" src="[#`./dde.js`]"></script>');
}
