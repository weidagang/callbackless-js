var assert = require('assert');

// import the core APIs from the callbackless module
var cbs = require('../src/callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;

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

  assertEquals$(unit(squareOf10), squareOf10$);
}

function testPromise_liftA() {
  console.log("Running " + arguments.callee.name);

  var squareSum = function (x, y) { return x * x + y * y; };
  var squareSum$ = liftA(squareSum);
  
  var squareSumOf2And3 = squareSum(2, 3);
  var squareSumOf2And3$ = squareSum$(unit(2), unit(3));

  assertEquals$(unit(squareSumOf2And3), squareSumOf2And3$);
}

function runTests() {
  testPromise_fmap();
  testPromise_liftA();
}

runTests();
