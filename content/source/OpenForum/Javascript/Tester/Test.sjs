/*
* Author: Nik Cross
* Description: 
*   var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");
*   tester.unitTest([test name]).
*     given([input]).
*	  when([function]).
*	  then([output]).
*	  thenOutputEquals([output]).
*	  thenOutputContains([part output]).
*	  thenAttributeEquals([key],[output]).
*	  thenOutputMatches([regex]);
*	  run();
* 
*	Only one then allowed at the moment
*/

function Test() {
  var tester = this;
  var queue = "/OpenForum/Javascript/Tester";
  var passed = 0;
  var failed = 0;

  var UnitTest = function(testName) {
    var name = testName;
    var self = this;
    var input = "";
    var checkFunction;
    var errorMessageFunction;
    var testFunction;

    self.given = function(givenInput) {
      input = givenInput;
      return self;
    };

    self.when = function(whenFunction) {
      testFunction= whenFunction;
      return self;
    };

    self.then = function(expected) {
      if(typeof(expected) == "function") {
        checkFunction = expected;
      } else {
        checkFunction = function(output) {
          return output===expected;
        };
      }
      errorMessageFunction = function(output) {
        if(typeof(expected) == "function") {
        	return "Expected Function "+expected+" to return true was false";
        } else {
        	return "Expected ("+JSON.stringify(expected)+") but found ("+JSON.stringify(output)+")";
        }
      };
      return this;
    };
    self.thenAttributeEquals = function(key,expected) {
      checkFunction = function(output) {
        return output[key]===expected;
      };
      errorMessageFunction = function(output) {
        return "Expected ("+key+"="+JSON.stringify(expected)+") but found ("+key+"="+JSON.stringify(output[key])+") in "+JSON.stringify(output);
      };
      return this;
    };
    self.thenEvaluationEquals = function(evil,expected) {
      checkFunction = function(output) {
        return JSON.stringify(eval( "("+JSON.stringify(output)+")."+evil ))==JSON.stringify(expected);
      };
      errorMessageFunction = function(output) {
        return "Expected (output."+evil+"="+JSON.stringify(expected)+") but found (output."+evil+"="+JSON.stringify(eval( "("+JSON.stringify(output)+")."+evil ))+") in "+JSON.stringify(output);
      };
      return this;
    };
    self.thenOutputEquals = self.then;
    self.thenOutputContains = function(expected) {
      checkFunction = function(output) {
        return output.indexOf(expected)!==-1;
      };
      errorMessageFunction = function(output) {
        return "Expected to contain ("+JSON.stringify(expected)+") but found ("+JSON.stringify(output)+")";
      };

      return this;
    };
    self.thenOutputMatches = function(expected) {
      checkFunction = function(output) {
        return output.match(expected)!==null;
      };
      errorMessageFunction = function(output) {
        return "Expected to match regular expression ("+JSON.stringify(expected)+") but found ("+JSON.stringify(output)+")";
      };

      return this;
    };

    self.run = function() {
      try{
        var output = null;
        if( typeof(testFunction)==="function") {
          output = testFunction(input);
        } else {
          output = testFunction;
        }

        if(checkFunction(output)===false) {
          tester.logFailed( name+". Input ("+JSON.stringify(input)+") "+errorMessageFunction(output));
          failed++;
          return false;
        } else {
          tester.logPassed(name);
          passed++;
          return true;
        }
      } catch(e) {
        failed++;
        tester.logFailed( name+". Exception ("+e+")");
      }
    };
  };

  tester.logPassed = function(message) {
    openForum.postMessageToQueue( queue,"  PASSED:  "+message);
  }
 
  tester.logFailed = function(message) {
    openForum.postMessageToQueue( queue,"  FAILED:  "+message);
  }
  
  tester.log = function(message) {
    openForum.postMessageToQueue( queue,"  MESSAGE:  "+message);
  };

  tester.unitTest = function(title) {
    return new UnitTest(title);
  };

  tester.getResults = function() {
    return  {tests: passed+failed, passed: passed, failed: failed};
  };
}