/**
 * This module contains a set of commonly used functions which work on the promise of string.
 */
var cbs_str = (function() {
  var cbs = require('./callbackless.js');
  var fmap = cbs.fmap;
  var liftA = cbs.liftA;
  
  /**
   * Returns the promise of the character at the specified index.
   *
   * charAt$ :: int -> Promise<String> -> Promise<String>
   */
  function charAt$(index, str$) {
    return fmap(function (str) {return str.charAt(index);})(str$);
  }
  
  /**
   * Returns the promise of the upper case string.
   *
   * toUpperCase$ :: Promise<String> -> Promise<String>
   */
  function toUpperCase$(str$) {
    return fmap(function (str) {return str != null ? str.toUpperCase() : null;})(str$);
  }
  
  /**
   * Combines the promises of two or more strings and returns a new promise of string.
   *
   * concat$ :: Promise<String> -> Promise<String> ... -> Promise<String>
   */
  function concat$() {
    function concat() {
      var result = "";
      for (var i = 0; i < arguments.length; i++) {
        result = result.concat(arguments[i]);
      }
      return result;
    }
    return liftA(concat).apply(null, arguments);
  }

  // module exports
  return {
    charAt$ : charAt$,
    toUpperCase$ : toUpperCase$,
    concat$ : concat$
  };
})();

module.exports = cbs_str;
