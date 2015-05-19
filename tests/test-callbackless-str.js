var assert = require('assert');

// import the core APIs from the callbackless module
var cbs = require('../src/callbackless.js');
var unit = cbs.unit;
var fmap = cbs.fmap;
var liftA = cbs.liftA;
var flatMap = cbs.flatMap;

// import the string APIs from the callbackless-str module
var cbs_str = require('../src/callbackless-str.js');
var charAt$ = cbs_str.charAt$;
var toUpperCase$ = cbs_str.toUpperCase$;
var concat$ = cbs_str.concat$;

// import the testing utils
var cbs_testing = require('../src/callbackless-testing.js');
var print$ = cbs_testing.print$;
var assertEquals$ = cbs_testing.assertEquals$;

// test cases

function testStringPromise_charAt$() {
  console.log("Running " + arguments.callee.name);

  var str$ = unit("hello callbackless!");
  var c0$ = charAt$(0, str$);
  var c4$ = charAt$(4, str$);
  var c999$ = charAt$(999, str$);
  assertEquals$(unit("h"), c0$);
  assertEquals$(unit("o"), c4$);
  assertEquals$(unit(""), c999$);
}

function testStringPromise_toUpperCase$() {
  console.log("Running " + arguments.callee.name);

  assertEquals$(unit(null), toUpperCase$(unit(null)));
  assertEquals$(unit(""), toUpperCase$(unit("")));
  assertEquals$(unit("HELLO CALLBACKLESS"), toUpperCase$(unit("Hello Callbackless")));
}

function testStringPromise_concat$() {
  console.log("Running " + arguments.callee.name);

  var str1$ = unit("hello ");
  var str2$ = unit("callbackless");
  var str3$ = unit("!");
  assertEquals$(unit(""), concat$());
  assertEquals$(unit("hello "), concat$(str1$));
  assertEquals$(unit("hello callbackless"), concat$(str1$, str2$));
  assertEquals$(unit("hello callbackless!"), concat$(str1$, str2$, str3$));
}

function runTests() {
  testStringPromise_charAt$();
  testStringPromise_toUpperCase$();
  testStringPromise_concat$();
}

runTests();
