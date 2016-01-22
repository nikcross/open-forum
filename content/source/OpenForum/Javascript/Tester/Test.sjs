function Test() {
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
      checkFunction = function(output) {
        return output===expected;
      };
      errorMessageFunction = function(output) {
        return "Expected ("+JSON.stringify(expected)+") but found ("+JSON.stringify(output)+")";
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
        var output = testFunction(input);

        if(checkFunction(output)===false) {
          openForum.postMessageToQueue( queue,"FAILED:  "+name+". Input ("+JSON.stringify(input)+") "+errorMessageFunction(output));
          failed++;
          return false;
        } else {
          openForum.postMessageToQueue( queue,"  PASSED: "+name);
          passed++;
          return true;
        }
      } catch(e) {
        failed++;
        openForum.postMessageToQueue( queue,"FAILED:  "+name+". Exception ("+e+")");
      }
    };
  };

  this.log = function(message) {
    openForum.postMessageToQueue( queue,"  MESSAGE:  "+message);
  };

  this.unitTest = function(title) {
    return new UnitTest(title);
  };
  
  this.getResults = function() {
    return  {tests: passed+failed, passed: passed, failed: failed};
  };
}