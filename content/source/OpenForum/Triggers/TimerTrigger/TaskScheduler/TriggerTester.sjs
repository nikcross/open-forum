/*
* Author: 
* Description: 
*/
var TriggerTester = function() {
  var self = this;

  self.runTrigger = function(pageName,fileName) {
    var script = "" + file.getAttachment(pageName,fileName);
    var startTime = new Date().getTime();
    var result;
    try{
      result = eval(script);
    } catch(e) {
      result = {error: e};
    }
    var endTime = new Date().getTime();
    var timeTaken = endTime-startTime;
    
    return {startTime: startTime, endTime: endTime, timeTaken: timeTaken, result: result};
  };
};