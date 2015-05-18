callbackless.js - abstract away callbacks
=======

JavaScript is asynchronous in nature, but too many callbacks put the code in a mess. Over the years, the community has invented a bunch of libraries trying to make it possible to write sync code to express async logic.

However, it seems to me that until today none of them are doing the thing right. The Promise abstraction in some of the libraries looks awkward. It doesn't make much sense than the async APIs, we can still smell the callbacks. And some of the libraries involve compilations and ``eval`` calls, which are really unnecessary.

Callbackless.js is the effect to achieve "abstract away callbacks" in a much better way. It's in plain ECMAScript 5, doesn't depend on any advanced features of ECMAScript 6 (e.g. Generator), and there's no compilations and ``eval`` involved.

The core of callbackless.js is the abstraction of Promise Monad. Forget about the Promise you have known in other libraries, they're totally different. A monad is a computation which returns values of type T. A promise monad is a computation which will be returning a value of type T in the future (maybe asynchronously). It turns out that callbackless.js is not only a successful application of Functor and Monad in JavaScript, but also a great tutorial for them. I hope every JavaScript programmer would be able to understand these advanced functional abstractions with this library.

Now, let's get a sense of how the code looks like with a sample code:

```javascript
// import the core APIs
var cbs = require('../callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;
var continue$ = cbs.continue$;

// import the file APIs
var cbs_fs = require('../callbackless-fs.js');
var readFile = cbs_fs.readFile;
var readFile$ = cbs_fs.readFile$;

// import the string APIs
var cbs_str = require('../callbackless-str.js');
var toUpperCase$ = cbs_str.toUpperCase$;
var concat$ = cbs_str.concat$;

// import the testing APIs
var cbs_testing = require('../callbackless-testing.js');
var assertEquals$ = cbs_testing.assertEquals$;

/**
 * This test case reads 2 text files asynchronously, converts the contents of
 * the first file to upper case, then concatenates it with the contents of the
 * second file.
 *
 * During the execution, there're 2 async file reading operations, but you see
 * no callbacks.
 */
function testFilePromise_functor() {
  // readFile :: String -> Promise<String>
  // readFile returns a promise of the contents of the file
  var data1$ = readFile('data/data_1.txt');
  var data2$ = readFile('data/data_2.txt');

  // toUpperCase$ :: Promise<String> -> Promise<String>
  // at this point, the value of data1 may not be available, but we don't care,
  // because establishing the relationship between 2 promises doesn't require
  // to know their actual value.
  var upperCaseData1$ = toUpperCase$(data1$);
  
  // concat$ :: Promise<String> -> Promise<String> -> Promise<String>
  // concatenates 2 promises of string returns another promise of string
  var data1AndData2$ = concat$(upperCaseData1$, data2$); 
  
  // unit :: String -> Promise<String>
  // wrapps the directly available data into the computation context of promise
  // then it could work with the lifted functions
  var expectedData1AndData2$ = unit("HELLO CALLBACKLESS.JS!cool!");
  
  // assertEquals$ :: Promise<String> -> Promise<String> -> void
  // asserts the values of the 2 promises are equal. The underlying assert will
  // be invoked when both of the 2 promises are finished.
  assertEquals$(expectedData1AndData2$, data1AndData2$);
}

/**
 * The test data contains 3 files. The contents of the previous file is the path
 * of the next file. This test starts from the path of the first file, then
 * follows the path one by one until the third file.
 *
 * During the execution, there're 2 async file reading operations, but you see
 * no callbacks.
 */
function testFilePromise_monad() {
  var path1 = 'data/file_1.txt';

  // readFile :: String -> Promise<String>
  // readFile returns a promise of the contents of the file
  var path2$ = readFile('data/file_1.txt');
  
  // readFile$ :: Promise<String> -> Promise<String>
  // readFile$ is the flatMapped form of readFile, which accepts a promise type
  // path parameter.
  var path3$ = readFile$(path2$);

  var data3$ = readFile$(path3$);
  var expectedData3$ = unit('Hey, I am here!')
  assertEquals$(expectedData3$, data3$);
}
```

See [tests](https://github.com/weidagang/callbackless-js/blob/master/tests/test-file-promise.js) for more details.
