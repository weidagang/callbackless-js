callbackless.js - abstract away callbacks
=======

JavaScript is asynchronous in nature, but too many callbacks put the code in a mess. Over the years, the community has invented a bunch of libraries trying to make it possible to write sync-style code to express async logic. However, it seems to me that until today none of them is doing the thing right. The Promise abstraction in some of the libraries looks awkward, it doesn't make much sense than the async APIs, we can still smell the callbacks. And some other libraries involve a compilation and ``eval``, which is unnecessarily heavyweight and complex.

Callbackless.js is the effect to achieve "abstract away callbacks" in a much better way. It's in plain ECMAScript 5, has no dependency on any advanced features of ECMAScript 6 (e.g. Generator), and there's no compilation and ``eval`` involved.

The core of callbackless.js is the abstraction of Promise Monad. Forget about the Promise you have known in other libraries, they're totally different. A monad is a computational context which returns values of type T. A promise monad is a computational context which will be returning a value of type T in the future (maybe asynchronously). Any operation on a plain type ``T``, e.g. ``toUpperCase :: String -> String``, there's a corresponding one on ``Promise<T>``, e.g. ``toUpperCase$ :: Promise<String> -> Promise<String>``. That's isomorphism. Because the computational context and the value are 2 orthogonal aspects, we can decouple them and reuse the existing functions on type ``T`` by lifting them to type ``Promise<T>``. That means you don't need to reimplement these functions for ``Promise<String>`` from scratch, just lift it as below:

``
// we have a function of type :: Int -> Int -> Int
var squareSum = function (x, y) { return x * x + y * y; };

// lift it to a function of type :: Promise<Int> -> Promise<Int> -> Promise<Int>,
// then it can work on promises.
var squareSum$ = liftA(squareSum);

// apply it to Promise<Int> the same way you apply it to Int
var result$ = squareSum$(unit(2), unit(3));
``

It turns out that callbackless.js is not only a successful application of Functor and Monad in JavaScript, but also a great tutorial to advanced functional programming for JavaScript programmers. I have the faith that every JavaScript programmer would be able to understand the "scary monsters" with this library.

Now, let's get a sense of how the code looks like with a sample code:

```javascript
// Naming convention: promises and functions on promises are named as xxx$.

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
  
  // assertEquals$ :: Promise<String> -> Promise<String> -> Promise<Boolean>
  // asserts the values of the 2 promises are equal. The underlying assert will
  // be invoked when both of the 2 promises are finished.
  assertEquals$(expectedData1AndData2$, data1AndData2$);
}

/**
 * The test data contains 3 files. The contents of the previous file is the path
 * of the next file. This test starts from the path of the first file, then
 * follows the path one by one until the third file.
 *
 * During the execution, there're 3 async file reading operations, but you see
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

/**
 * This test case demonstrates code reuse by lifting a function on type T into a
 * function on type Promise<T>.
 */
function testPromise_liftA() {
  // we have a function of type :: Int -> Int -> Int
  var squareSum = function (x, y) { return x * x + y * y; };
  
  // lift it to a function of type :: Promise<Int> -> Promise<Int> -> Promise<Int>,
  // then it can work on promises.
  var squareSum$ = liftA(squareSum);

  assertEquals$(unit(5), squareSum$(unit(1), unit(2)));
}
```

See [tests](https://github.com/weidagang/callbackless-js/blob/master/tests/test-callbackless-fs.js) for more details.
