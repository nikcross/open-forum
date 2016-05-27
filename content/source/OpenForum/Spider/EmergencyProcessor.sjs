function EmergencyProcessor() {
  var self = this;
  var log;
  self.setLog = function( newLog ) {
    log = newLog;
  };

  self.processPage = function(pageName) {
    if(pageName.indexOf("/history")!=-1) {
      return;
    }
    log("EmergencyProcessor processing "+pageName);
  };

  self.processFile = function(pageName,fileName) {
    if(fileName=="access.json") {
      log("EmergencyProcessor processing access.json on page "+pageName);
      var jsonData = file.getAttachment(pageName,fileName);
      var access = JSON.parse( jsonData );
      if(access.userAccess.write) {

        log("=== ERROR === found in access.json on page "+pageName);

        access.userAccess.update = access.userAccess.write;
        delete access.userAccess.write;

        file.saveAttachment(pageName,fileName,JSON.stringify(access,null,4));
        log("Access now "+JSON.stringify(access));
      }
    }
  };
}