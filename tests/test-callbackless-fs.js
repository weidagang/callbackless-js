var assert = require('assert');
var path = require('path');

// import the core APIs
var cbs = require('../src/callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;
var continue$ = cbs.continue$;

// import the file APIs
var cbs_fs = require('../src/callbackless-fs.js');
var readFile = cbs_fs.readFile;
var readFile$ = cbs_fs.readFile$;

// import the string APIs
var cbs_str = require('../src/callbackless-str.js');
var toUpperCase$ = cbs_str.toUpperCase$;
var concat$ = cbs_str.concat$;

// import the testing APIs
var cbs_testing = require('../src/callbackless-testing.js');
var print$ = cbs_testing.print$;
var assertEquals$ = cbs_testing.assertEquals$;

/**
 * This test case reads 2 files asynchronously, converts the contents of the first file to upper
 * case, concatenates it with the contents of the second file.
 *
 * There're 2 async file reading operations under the hood, but you see no callbacks.
 */
function testFilePromise_functor() {
  console.log('Running ' + arguments.callee.name);

  // readFile returns a promise of the data which will be available in the future, but we can do
  // operations on it immediately before it's actually available.
  var data1$ = readFile(path.join(__dirname, '/data/data_1.txt')); // at this point we don't know the content of data_1.txt
  var data2$ = readFile(path.join(__dirname, '/data/data_2.txt')); // at this point we don't know the content of data_2.txt
  
  // apply toUpperCase$ to a promise of string and return another promise of string. The actual value
  // may not be available at this point, but we don't care.
  var upperCaseData1$ = toUpperCase$(data1$);
  
  // unit wrapps (lifts) a directly available data into a computational context (promise), so that
  // it can work with lifted functions.
  var expectedUpperCaseData1$ = unit("HELLO CALLBACKLESS.JS!");
 
  // assertEquals$ asserts the data in the two promises are equal.
  // The underlying _assertEquals will be invoked when the 2 promises are finished.
  assertEquals$(expectedUpperCaseData1$, upperCaseData1$);
  
  // concatenates 2 promises of strings and returns another promise of string
  // keep in mind that it just establishes the relationship, we don't care the actual value now.
  var data1AndData2$ = concat$(data1$, data2$); 

  // unit wrapps (lifts) a directly available data into a computational context (promise).
  var expectedData1AndData2$ = unit("hello callbackless.js!cool!");

  // assertEquals$ asserts the data in the two promises are equal.
  // The underlying _assertEquals will be invoked when the 2 promises are finished.
  var passed$ = assertEquals$(expectedData1AndData2$, data1AndData2$);

  return passed$;
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
  console.log('Running ' + arguments.callee.name);
  // pathJoin :: Promise<String> ... -> Promise<String>
  var pathJoin$ = liftA(path.join);
  var path1 = path.join(__dirname, 'data/file_1.txt');
  var path2$ = pathJoin$(unit(__dirname), readFile(path1));
  var path3$ = pathJoin$(unit(__dirname), readFile$(path2$));
  var data3$ = readFile$(path3$);
  var expectedData3$ = unit('Hey, I am here!')
  var passed$ = assertEquals$(expectedData3$, data3$);

  return passed$;
}

function _toUpperCase(str) {
  return str.toUpperCase();
}

function runTests() {
  var result1$ = testFilePromise_functor();
  var result2$ = continue$(result1$, testFilePromise_monad);
  continue$(result2$, function() { console.log("Done"); });
}

runTests();
