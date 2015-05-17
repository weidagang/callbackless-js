var cbs_fs = (function() {
  var fs = require('fs');
  var cbs = require('./callbackless.js');
  
  /**
   * Returns the promise of a file contents.
   *
   * readFile :: String -> String -> Promise<String>
   * @param path :: String
   * @param encoding :: String
   * @return promise :: Promise<String>
   */
  function readFile(path, encoding) {
    var _encoding = encoding || 'utf8';
    var _promise = cbs.promise(path);
    fs.readFile(path, _encoding, function(error, data) {
      if (error) {
        _promise.__notifyFailure__(error);
      } else {
        _promise.__notifySuccess__(data);
      }
    });
    return _promise;
  }

  /**
   * The flatMapped function of readFile.
   *
   * readFile$ :: Promise<String> -> Promise<String> -> Promise<String>
   * @param path$ :: Promise<String>
   * @param encoding$ :: Promise<String>
   * @return promise :: Promise<String>
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
