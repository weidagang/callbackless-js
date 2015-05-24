var assert = require('assert');
var path = require('path');

// import the core APIs from the callbackless module
var cbs = require('../src/callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;
var continue$ = cbs.continue$;

// import the testing utils
var cbs_testing = require('../src/callbackless-testing.js');
var print$ = cbs_testing.print$;
var assertEquals$ = cbs_testing.assertEquals$;

// test cases

function testPromise_fmap() {
  console.log("Running " + arguments.callee.name);

  var square = function (x) { return x * x; };
  var square$ = fmap(square);
  
  var squareOf10 = square(10);
  var squareOf10$ = square$(unit(10));

  var passed$ = assertEquals$(unit(squareOf10), squareOf10$);

  return passed$;
}

function testPromise_liftA() {
  console.log("Running " + arguments.callee.name);

  var squareSum = function (x, y) { return x * x + y * y; };
  var squareSum$ = liftA(squareSum);
  
  var squareSumOf2And3 = squareSum(2, 3);
  var squareSumOf2And3$ = squareSum$(unit(2), unit(3));

  var passed$ = assertEquals$(unit(squareSumOf2And3), squareSumOf2And3$);

  return passed$;
}

function runTests() {
  print$(unit('Start testing ' + __filename.slice(__filename.lastIndexOf(path.sep)+1)));
  var result1$ = testPromise_fmap();
  var result2$ = continue$(result1$, testPromise_liftA);
  continue$(result2$, function() { console.log("Done\n"); });
}

runTests();
