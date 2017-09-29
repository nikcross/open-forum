/*
* Author: Nik Cross
* Description: 
*
* MockLog = js.getObject("/OpenForum/Javascript/Tester","MockLog.sjs");
* mockLog = MockLog.getMock();
*/
var MockLog = function() {
  var self = this;
  
  self.getMock = function() {
    return new function() {
      var self = this;
      var errorMessage = "No errors logged";
      var infoMessage = "No info logged";
      var debugMessage = "No debug logged";
      self.error = function(message) {
        errorMessage = message;
      };

      self.getErrorMessage = function() {
        return errorMessage;
      };

      self.info = function(message) {
        infoMessage = message;
      };

      self.getInfoMessage = function() {
        return infoMessage;
      };
      
      self.debug = function(message) {
        debugMessage = message;
      };

      self.getDebugMessage = function() {
        return debugMessage;
      };
    }
  };
};