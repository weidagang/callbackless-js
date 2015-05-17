callbackless.js 
=======

JavaScript is asynchronous in nature, but too many callbacks put the code in a mess. Over the years, the community has created a bunch of libraries trying to abstract callbacks away and allowing programmers to write sync code to express async logic.

But it seems that until today none of them are doing it right. The Promise abstraction in some of the libraries looks awkward. It doesn't make much sense than the async APIs, we can still smell the callbacks. And some of the libraries involve compliations and ``eval`` calls, which are not necessary.

Callbackless.js is the effect to achieve "abstract away callbacks" in a much better way than any other known libraries. It's in plain ECMAScript 5, doesn't depend on any advanced features of ECMAScript 6 (e.g. Generator), and there's no compliation and ``eval`` involved.

The core of callbackless.js is the abstraction of Promise Monad. Forget the Promise you know in other libraries, they're totally different. A monad is a computation which returns values of type T. A promise monad is a computation which will be returning a value of type T in the future (maybe asynchronously). It turns out that callbackless.js is not only the best way to abstract away callbacks, but also the best tutorial for Functor and Monad.

Let's give you a sense how the code looks like with a sample code:

```javascript
var cbs_fs = require('../callbackless-fs.js');
var readFile = cbs_fs.readFile;
var readFile$ = cbs_fs.readFile$;

/**
 * The test data involves 3 files, the contents of the previous file is the path of the next file.
 * This test case starts from the path of the first file, then follows the path one by one until
 * the third file.
 *
 * In the runtime, there're 3 asynchronous file reading involved under the hood, but all the
 * callbacks are abstracted away by the promise.
 */
// Imports the file APIs from the callbackless-fs module.
function testFilePromise_monad() {
  var path1 = 'data/file_1.txt';
  var path2$ = readFile('data/file_1.txt');
  var path3$ = readFile$(path2$);
  var data3$ = readFile$(path3$);
  var expectedData3$ = unit('Hey, I am here!')
  assertEquals$(expectedData3$, data3$);
}
```
