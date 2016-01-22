function SpiderProcessorTemplate() {
  var self = this;
  var log;
  self.setLog = function( newLog ) {
    log = newLog;
  };

  self.processPage = function(pageName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    log("? processing "+pageName);
  };
  
  self.processFile = function(pageName,fileName) {
  };
}