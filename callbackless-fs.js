var callbackless_fs = (function() {
  var fs = require('fs');
  var callbackless = require('./callbackless.js');
  
  /**
   * readFile$ :: String -> String -> Promise<String>
   * @param path :: String
   * @param encoding :: String
   * @return promise :: Promise<String>
   */
  function readFile$(path, encoding) {
    var _encoding = encoding || 'utf8';
    var _promise = callbackless.promise(path);
    fs.readFile(path, _encoding, function(error, data) {
      if (error) {
        _promise.__notifyFailure__(error);
      } else {
        _promise.__notifySuccess__(data);
      }
    });
    return _promise;
  }

  // module exports
  return {
    readFile$ : readFile$
  };
})();

module.exports = callbackless_fs;
