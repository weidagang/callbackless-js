var assert = require('assert');

// imports the core APIs from the callbackless module
var cbs = require('../callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;

// imports the file APIs from the callbackless-fs module
var cbs_fs = require('../callbackless-fs.js');
var readFile = cbs_fs.readFile;
var readFile$ = cbs_fs.readFile$;

/**
 * This test case tests file promise API of callbackless.
 *
 * The point is to demonstrate using sync code to express async logic with promises. Under the
 * hood, the test case calls the fs.readFile(path, encoding, callback) async API of Node, therefore
 * there's no blocking calls. But with the file promise API of callbackless-fs, all the async code
 * is abstracted away, you can never find any callbacks in the code.
 *
 * Naming convention for variables (and functions): 
 *
 * <data>$: the promise for the data, e.g. data1$ means the promise of the data in file1
 * <fn>$: the lifted function for the original function fn, which accepts and returns promises, e.g.
 *        the toUpperCase$ is the lifted function for toUpperCase which works on string promises.
 */
function testFilePromise_functor() {
  // For better demonstration, I used a local variable for each step. It's not necessary, feel free
  // to inline them.

  // readFile returns a promise of the data which will be available in the future, but we can do
  // operations on it immediately before it's actually available.
  var data1$ = readFile('data/data_1.txt'); // at this point we don't know the content of data_1.txt
  var data2$ = readFile('data/data_2.txt'); // at this point we don't know the content of data_2.txt
  var data3$ = readFile('data/data_3.txt'); // at this point we don't know the content of data_3.txt
  
  // fmap turns (lifts) a function of type T -> R into a function of type Promise<T> -> Promise<R>.
  // Therefore, it allows us to reuse the function in a different computational context (promise).
  // _toUpperCase accepts a string and returns a string, toUpperCase$ accepts a promise of string
  // and returns a promise of string. The magic is inside of fmap. Try to figure out it by yourself!
  var toUpperCase$ = fmap(_toUpperCase);

  // apply toUpperCase$ to a promise of string and return another promise of string. The actual value
  // may not be available at this point, but we don't care, it just establishes the relationship
  // between data1$ and upperCaseData1$. Be aware that establishing a relationship between two
  // variables has nothing to do with knowing their actual value, think it carefully!
  var upperCaseData1$ = toUpperCase$(data1$);
  
  // unit wrapps (lifts) a directly available data into a computational context (promise), so that
  // it can work with lifted functions. A directly available data is just a special case of a
  // promise, right?
  var expectedUpperCaseData1$ = unit("HELLO CALLBACKLESS.JS!");
 
  // liftA lifts a function with multiple parameters so that it can work with promises.
  // The type of _assertEquals: T -> T -> void
  // The type of assertEquals$ is: Promise<T> -> Promise<T> -> void
  var assertEquals$ = liftA(_assertEquals);
 
  // assertEquals$ asserts the data in the two promises are equal.
  // The underlying _assertEquals will be invoked when the 2 promises are finished.
  assertEquals$(expectedUpperCaseData1$, upperCaseData1$);
  
  // _concat concatenates 2 strings, while concat$ concatenates 2 promises of strings.
  var concat$ = liftA(_concat);

  // concatenates 2 promises of strings and returns another promise of string
  // keep in mind that it just establishes the relationship, we don't care the actual value now.
  var data1AndData2$ = concat$(data1$, data2$); 

  // unit wrapps (lifts) a directly available data into a computational context (promise).
  var expectedData1AndData2$ = unit("hello callbackless.js!cool!");

  // assertEquals$ asserts the data in the two promises are equal.
  // The underlying _assertEquals will be invoked when the 2 promises are finished.
  assertEquals$(expectedData1AndData2$, data1AndData2$);

  // print the data1 + data2 to STDOUT. The print$ is inlined here.
  // The underlying _print will be invoked when the 2 promises are finished.
  //fmap(_print)(concat$(data1$, data2$));
}

/**
 * The test data contains 3 files. The contents of the previous file is the path of the next file.
 * This test starts from the path of the first file, then follows the path one by one until the
 * third file.
 *
 * During the execution, there're 3 asynchronous file reading operations involved under the hood,
 * but all the callbacks are abstracted away by the promise.
 */
function testFilePromise_monad() {
  var path1 = 'data/file_1.txt';
  var path2$ = readFile('data/file_1.txt');
  var path3$ = readFile$(path2$);
  var data3$ = readFile$(path3$);
  var expectedData3$ = unit('Hey, I am here!')
  var assertEquals$ = liftA(_assertEquals);
  assertEquals$(expectedData3$, data3$);
}

function _toUpperCase(str) {
  return str.toUpperCase();
}

function _concat(str1, str2) {
  return str1 + str2;
}

function _equals(obj1, obj2) {
  return obj1 == obj2; 
}

function _print(str) {
  console.log(str);
}

function _assertEquals(expected, actual) {
  assert(expected == actual, 'assertEquals failed, expected: ' + expected + ', actual: ' + actual);
  console.log("PASSED");
}

testFilePromise_functor();
testFilePromise_monad();
