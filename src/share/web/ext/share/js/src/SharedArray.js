/** @namespace ext.share */
js.extend('ext.share', function (js) {

  var _package = this;

  _package.SharedArray = function () {
    this.a = [];
  };

  var _proto = _package.SharedArray.prototype = js.lang.createMethods();

  /**
   * @function getArray
   * Return the wraped array.
   */

  _proto.getArray = function () {
    return this.a;
  };

  /**
   * @function pop
   * Removes the last element from an array and returns that element.
   */

  _proto.pop = function () {
    var result = Array.pop.apply(this.a, arguments);
    this.executeAction('pop', result);
    return result;
  };

  /**
   * @function push
   * Adds one or more elements to the end of an array and returns the new 
   * length of the array.
   */

  _proto.push = function () {
    var result = Array.push.apply(this.a, arguments);
    this.executeAction('push', result);
    return result;
  };

  /**
   * @function reverse
   * Reverses the order of the elements of an array -- the first becomes the 
   * last, and the last becomes the first.
   */

  _proto.reverse = function () {
    var result = Array.reverse.apply(this.a, arguments);
    this.executeAction('reverse', result);
    return result;
  };

  /**
   * @function shift
   * Removes the first element from an array and returns that element.
   */

  _proto.shift = function () {
    var result = Array.shift.apply(this.a, arguments);
    this.executeAction('shift', result);
    return result;
  };

  /**
   * @function sort
   * Sorts the elements of an array.
   */

  _proto.sort = function () {
    var result = Array.sort.apply(this.a, arguments);
    this.executeAction('sort', result);
    return result;
  };

  /**
   * @function splice
   * Adds and/or removes elements from an array.
   */

  _proto.splice = function () {
    var result = Array.splice.apply(this.a, arguments);
    this.executeAction('splice', result);
    return result;
  };

  /**
   * @function unshift
   * Adds one or more elements to the front of an array and returns the new 
   * length of the array.
   */

  _proto.unshift = function () {
    var result = Array.unshift.apply(this.a, arguments);
    this.executeAction('unshift', result);
    return result;
  };

  /**
   * @function concat
   * Returns a new array comprised of this array joined with other array(s) 
   * and/or value(s).
   */

  _proto.concat = function () {
    var result = Array.concat.apply(this.a, arguments);
    this.executeAction('concat', result);
    return result;
  };

  /**
   * @function join
   * Joins all elements of an array into a string.
   */

  _proto.join = function () {
    var result = Array.join.apply(this.a, arguments);
    this.executeAction('join', result);
    return result;
  };

  /**
   * @function slice
   * Extracts a section of an array and returns a new array.
   */

  _proto.slice = function () {
    var result = Array.slice.apply(this.a, arguments);
    this.executeAction('slice', result);
    return result;
  };

  /**
   * @function toString
   * Returns a string representing the array and its elements. Overrides the 
   * Object.prototype.toString method.
   */

  _proto.toString = function () {
    var result = Array.toString.apply(this.a, arguments);
    this.executeAction('toString', result);
    return result;
  };

});
