function CatalogueBuilder() {
  var self = this;
  var log;
  var pages = [];
  self.setLog = function( newLog ) {
    log = newLog;
  };

  self.processPage = function(pageName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    log("CatalogueBuilder processing "+pageName+" total:"+pages.length);
    pages.push(pageName);
  };
  
  self.processFile = function(pageName,fileName) {
  };
}