/*
* Author: 
* Description: 
*/

var Attach = function() {
  var self = this;

  self.uploadFile = function(pageName,fileName,transaction) {
    transaction.userCanPerformAction(pageName,"update",true); 
    transaction.confirmPostAttachment(xmlHeader);

    var user = transaction.getUser();		
    openForum.addJournalEntry("File ["+pageName+"/"+fileName+"] added to Page ["+pageName+"] by "+user);
    var page = wiki.buildPage(pageName);
    transaction.goToPage(pageName);
  };

  self.uploadFromUrl = function(pageName,fileName,url,transaction) {
    try{
      external.getURLAsFile( url,pageName,fileName );  
      result = {result: "ok", message: "Uploaded "+url+" to "+pageName+"/"+fileName };
    } catch (e) {
      transaction.sendJSON( JSON.stringify({result: "error",message: "Failed to upload "+url+ " to " +pageName+"/"+fileName+" "+e}));
    }
  };
};