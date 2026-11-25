/*
* Author: 
* Description: 
*/

var Time = new function() {
  var self = this;

  var lastMinute = new Date().getMinutes();

  self.watchTime = function() {
    if( new Date().getMinutes()!=lastMinute) {
      lastMinute = new Date().getMinutes();
      return true;
    } else {
      return false;
    }
  };

  self.sayTime = function(match,replyTemplate) {
    var time = new Date().toLocaleTimeString();
    assistant.say( replyTemplate,[time] );
  };
};