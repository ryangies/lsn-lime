js.extend('lsn.ext.dde', function (js) {

  var CAction = js.action.ActionDispatcher;

  this.Deltas = function (dc) {
    CAction.apply(this);
    this.dc = dc;
    this.queue = new js.data.HashList();
  };

  var Deltas = this.Deltas.prototype = js.lang.createMethods(CAction);

  Deltas.isUpToDate = function () {
    return this.queue.length == 0;
  };

  Deltas.addDelta = function (verb, target, value) {
    if (target.indexOf('/') != 0) {
      alert('Cannot add delta: ' + target);
      return;
    }
    js.lang.assert(target.indexOf('/') == 0);
    // Multiple remove comands are allowed on the same address.  This is
    // because we must adjust the array index.
    //
    // XXX: Server does not check modified time!
    //
    var uniq = verb == 'remove' ? js.util.randomId() : verb + target;
    var key = js.data.md5.sum(uniq);
    var cmd = this.queue.get(key);
    if (cmd) {
      cmd[2] = value;
    } else {
      cmd = this.queue.set(key, js.util.args(arguments));
    }
  };

  var _order = {
    'store':    0,
    'remove':   1,
    'reorder':  2,
    'insert':   3,
    'copy':     4
  };

  Deltas.commit = function () {
    this.dc.batch(this.queue.values().sort(function (a, b) {
      return _order[a[0]] - _order[b[0]];
    }), [this.onComplete, this]);
  };

  Deltas.onComplete = function (result) {
    this.clear();
    this.dispatchAction('complete');
  };

  Deltas.clear = function () {
    this.queue.clear();
  };

});
