/*
* Author: 
* Description: 
*/
function RebuildAllPages() {
  var self = this;
  var log;
  self.setLog = function( newLog ) {
    log = newLog;
  };

  self.setUp = function() {
  };
  
  self.tearDown = function() {
  };
  
  self.processPage = function(pageName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    try{
    openForum.refreshPage(pageName);
    log("Rebuilt "+pageName);
    } catch(e) {
    log("Failed to rebuild "+pageName+" Error:"+e);
    }
  };
  
  self.processFile = function(pageName,fileName) {
  };
}