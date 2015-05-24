/**
 * This module implements the File Promise.
 *
 * author: Dagang Wei (weidagang@gmail.com)
 */
var cbs_fs = (function() {
  var fs = require('fs');
  var cbs = require('./callbackless.js');
  
  /**
   * Returns the promise of a file contents.
   *
   * readFile :: String -> String -> Promise<String>
   * @param path :: String
   * @param encoding :: String
   * @return data$ :: Promise<String>
   */
  function readFile(path, encoding) {
    var _encoding = encoding || 'utf8';
    var data$ = cbs.promise();
    fs.readFile(path, _encoding, function(error, data) {
      if (error) {
        data$.__notifyFailure__(error);
      } else {
        data$.__notifySuccess__(data);
      }
    });
    return data$;
  }

  /**
   * The flatMapped function of readFile.
   *
   * readFile$ :: Promise<String> -> Promise<String> -> Promise<String>
   * @param path$ :: Promise<String>
   * @param encoding$ :: Promise<String>
   * @return data$ :: Promise<String>
   */
  function readFile$(path$, encoding$) {
    return cbs.flatMap(readFile)(path$, encoding$);
  }

  // module exports
  return {
    readFile : readFile,
    readFile$ : readFile$
  };
})();

module.exports = cbs_fs;
