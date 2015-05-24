var assert = require('assert');
var path = require('path');

// import the core APIs from the callbackless module
var cbs = require('../src/callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;
var continue$ = cbs.continue$;

// import the timer APIs
var cbs_timer = require('../src/callbackless-timer.js');
var delay = cbs_timer.delay;

// import the testing utils
var cbs_testing = require('../src/callbackless-testing.js');
var print$ = cbs_testing.print$;
var assertEquals$ = cbs_testing.assertEquals$;

// test cases

function testTimerPromise_fmap() {
  console.log("Running " + arguments.callee.name);

  var x = 10;
  var x$ = delay(200 /* milliseconds */, x);

  var square = function (x) { return x * x; };
  var square$ = fmap(square);
  
  var squareX = square(x);
  var squareX$ = square$(x$);
  var passed$ = assertEquals$(unit(squareX), squareX$);
  
  return passed$;
}

function testTimerPromise_liftA() {
  console.log("Running " + arguments.callee.name);

  var x = 2;
  var y = 3;
  var x$ = delay(200 /* milliseconds */, x);
  var y$ = delay(300 /* milliseconds */, y);

  var squareSum = function (x, y) { return x * x + y * y; };
  var squareSum$ = liftA(squareSum);
  
  var squareSumXY = squareSum(x, y);
  var squareSumXY$ = squareSum$(x$, y$);
  var passed$ = assertEquals$(unit(squareSumXY), squareSumXY$);

  return passed$;
}

function runTests() {
  print$(unit('Start testing ' + __filename.slice(__filename.lastIndexOf(path.sep)+1)));
  var passed1$ = testTimerPromise_fmap();
  var passed2$ = continue$(passed1$, testTimerPromise_liftA);
  continue$(passed2$, function() { console.log("Done\n"); });
}

runTests();
