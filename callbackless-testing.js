/**
 * This module contains a set of testing utils.
 *
 * author: Dagang Wei (weidagang@gmail.com)
 */
var cbs_testing = (function() {
  // import dependencies
  var assert = require('assert');
  var cbs = require('./callbackless.js');
  var unit = cbs.unit;
  var fmap = cbs.fmap;
  var liftA = cbs.liftA;
 
  /**
   * Prints a promise of string to the STDOUT
   */
  var print$ = fmap(function(str) { console.log(str); });

  /**
   * Asserts 2 promises are equal.
   */
  var assertEquals$ = liftA(function (expected, actual) {
    assert(
      expected == actual, 'assertEquals failed, expected: ' + expected + ', actual: ' + actual);
    console.log("ASSERTION PASSED");
    return true;
  });
  
  // module exports
  return {
    print$ : print$,
    assertEquals$ : assertEquals$,
  };
})();

module.exports = cbs_testing;
