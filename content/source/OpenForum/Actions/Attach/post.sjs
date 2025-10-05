try{
  xmlHeader = transaction.getPostFileData();
  fileName = transaction.getPostParameter("fileName");
  pageName = transaction.getParameter("page");

  transaction.userCanPerformAction(pageName,"update",true); 
  transaction.confirmPostAttachment(xmlHeader);

  user = transaction.getUser();		
  wiki.addJournalEntry("File ["+pageName+"/"+fileName+"] added to Page ["+pageName+"] by "+user);
  page = wiki.buildPage(pageName);
  //transaction.goToPage(pageName);
  transaction.sendJSON( JSON.stringify({result: "ok",message: "Uploaded: "+fileName}));
} catch(e) {
    transaction.sendJSON( JSON.stringify({result: "error",message: "Error: "+e}));
}