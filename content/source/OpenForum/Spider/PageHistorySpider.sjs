function PageHistorySpider() {
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
    if(pageName.indexOf("/history")==-1) {
      return;
    }
    
    var list = file.getAttachmentsForPage( pageName );
    if(list.size()>50) {
    	log("History " + pageName + " has " + list.size() + " archived files");
    }
  };
  
  self.processFile = function(pageName,fileName) {
  };
}