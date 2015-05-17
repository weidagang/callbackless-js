callbackless.js 
=======

JavaScript is asynchronous in nature, but too many callbacks put the code in a mess. Over the years, the community has created a bunch of libraries trying to abstract callbacks away and allowing programmers to write sync code to express async logic.

But it seems that until today none of them are doing it right. The Promise abstraction in some of the libraries looks awkward. It doesn't make much sense than the async APIs, we can still smell the callbacks. And some of the libraries involve compliations and ``eval`` calls, which are not necessary.

Callbackless.js is the effect to achieve "abstract away callbacks" in a much better way than any other known libraries. It's in plain ECMAScript 5, doesn't depend on any advanced features of ECMAScript 6 (e.g. Generator), and there's no compliation and ``eval`` involved.

The core of callbackless.js is the abstraction of Promise Monad. Forget the Promise you know in other libraries, they're totally different. A monad is a computation which returns values of type T. A promise monad is a computation which will be returning a value of type T in the future (maybe asynchronously). It turns out that callbackless.js is not only the best way to abstract away callbacks, but also the best tutorial for Functor and Monad.

Let's get a sense how the code looks like with a sample code:

```javascript
// Imports the core APIs from the callbackless module
var cbs = require('../callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;

// Imports the file APIs from the callbackless-fs module.
var cbs_fs = require('../callbackless-fs.js');
var readFile = cbs_fs.readFile;
var readFile$ = cbs_fs.readFile$;

/**
 * This test case reads 2 text files asynchronously, converts the contents of the first file to
 * upper case, then concatenates it with the contents of the second file.
 *
 * During the execution, there're 2 async file reading operations, but you see no callbacks.
 */
function testFilePromise_functor() {
  var data1$ = readFile('data/data_1.txt');
  var data2$ = readFile('data/data_2.txt');
  var upperCaseData1$ = toUpperCase$(data1$);
  var data1AndData2$ = concat$(upperCaseData1$, data2$); 
  var expectedData1AndData2$ = unit("HELLO CALLBACKLESS.JS!cool!");
  assertEquals$(expectedData1AndData2$, data1AndData2$);
}

/**
 * The test data contains 3 files. The contents of the previous file is the path of the next file.
 * This test starts from the path of the first file, then follows the path one by one until the
 * third file.
 *
 * During the execution, there're 3 async file reading operations, but you see no callbacks.
 */
function testFilePromise_monad() {
  var path1 = 'data/file_1.txt';
  var path2$ = readFile('data/file_1.txt');
  var path3$ = readFile$(path2$);
  var data3$ = readFile$(path3$);
  var expectedData3$ = unit('Hey, I am here!')
  assertEquals$(expectedData3$, data3$);
}
```

See tests for more details.
