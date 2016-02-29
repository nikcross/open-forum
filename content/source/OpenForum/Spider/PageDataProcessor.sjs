function PageDataProcessor() {
  var self = this;
  var log;

  var dataObject = js.getObject("/OpenForum/Javascript/Page","Data.js");

  self.setLog = function( newLog ) {
    log = newLog;
  };

  self.processPage = function(pageName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    log("");
    log("PageDataProcessor processing "+pageName);
    
    if(file.attachmentExists(pageName,"page.content")) {
      log( pageName + " has page.content");
      
      dataObject.setPageName(pageName);
      if(!file.attachmentExists(pageName,"data.json")) {
      	log( pageName + " DOES NOT have data.json");
      }
      
      dataObject.set("pageName",pageName,"insert");
      dataObject.set("title",""+openForum.wikiToTitleName(pageName),"insert");
      
      dataObject.save();
    } else {
      log( pageName + " DOES NOT have page.content");
      if(file.attachmentExists(pageName,"data.json")) {
        log( "Deleteing data.json from "+pageName);
        var result = file.deleteAttachmentNoBackup(pageName,"data.json");
        if(result==true /*Bug fixed in next release*/) { log( "FAILED TO DELETE data.json from "+pageName); };
      }
    }
  };

  self.processFile = function(pageName,fileName) {
  };
}