/*
* Author: 
* Description: A fully featured example of Virtual Assistant
*/
var DiskSpace = new function() {
  var self = this;
  var GIG = 1000000000;
  
  var formatAsGig = function(value) {
    return Math.round((value*10)/GIG)/10;
  };

  var formatAsPercent = function(value,total) {
    return Math.ceil((value*1000)/total)/10;
  };
  
  self.getDiskSpace = function(match,replyTemplate) {    
    JSON.get("/OpenForum/SystemMonitor","getState","json=true").onSuccess( 
      function(response) {
        response.disk.total = formatAsGig(response.disk.total);
        response.disk.free = formatAsGig(response.disk.free);
        response.disk.pcFree = formatAsPercent(response.disk.free,response.disk.total);

        if(typeof Context != "undefined") {
      		Context.setSubject(
              {
                name: "disk-space",
                disk: {
                  total: response.disk.total,
                  free: response.disk.free,
                  pcFree: response.disk.pcFree
              	}
              }
            );
    	}
        
        assistant.say(replyTemplate.main,[response.disk.total,response.disk.free]);
        if(typeof Context != "undefined") {
          
          assistant.say(replyTemplate.question);
          
          Context.addConfirmAction(match,replyTemplate.percentage,
          	function(match,replyTemplate,state) {
            	if(state==true) {
                	assistant.say(replyTemplate,[response.disk.pcFree]);
                }
          	}
          );
        }
      }
    ).go();  
  };
  
  self.getDiskSpacePercentage = function(match,replyTemplate) {
    if(typeof Context != "undefined") {
      var subject = Context.getSubject();
	  if(subject && subject.name=="disk-space") {
        
        assistant.say(replyTemplate,[subject.disk.pcFree]);
        return;
      }
    }
    
    return false;
  };
};