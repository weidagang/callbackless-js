/**
 * This module contains the implementation of Timer Promise.
 */
var cbs_timer = (function() {
  var cbs = require('./callbackless.js');
  var promise = cbs.promise;
  
  /**
   * Returns a promise whose value will be available when the timer expires.
   *
   * delay$ :: int -> T -> Promise<T>
   */
  function delay(milliseconds, data) {
    var p$ = promise();
    setTimeout(function () { p$.__notifySuccess__(data); }, milliseconds);
    return p$;
  }
  
  // module exports
  return {
    delay : delay,
  };
})();

module.exports = cbs_timer;
