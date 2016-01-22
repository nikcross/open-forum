function TestRunner() {
  var self = this;
  var log;
  var pages = [];
  self.setLog = function( newLog ) {
    log = newLog;
  };
  
  
  self.processPage = function(pageName) {
  };
  
  self.processFile = function(pageName,fileName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    if(fileName.indexOf("test.sjs")!=-1) {
      log("  Running Tests at "+pageName+"/"+fileName);
      var script = file.getAttachment(pageName,fileName);
      js.startJavascript(pageName+"/"+fileName,script);
    }
  };
}