if(typeof(pageName)=="undefined")
{
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try {
  transaction.userCanPerformAction(pageName,"delete",true); 
  fileName = transaction.getParameter("fileName");

  var json = false;
  var returnType = transaction.getParameter("returnType");

  if(returnType!==null && (""+returnType)=="json") {
    json = true;
  }

  if( fileName===null ) {
    try{
      openForum.deletePage(pageName);
    } catch(e) {
    }

    var deleted = !(file.pageExists( pageName ));

    if(deleted) {
      //TODO Handle pages deleted from /OpenForum/DeletedPages
      data = file.getAttachment("/OpenForum/DeletedPages","page.content");
      data = data + "\n*[Undelete "+pageName+"|/OpenForum/Actions/Move?pageName=/OpenForum/DeletedPages/"+pageName+"&newPageName="+pageName+"]";
      file.saveAttachment("/OpenForum/DeletedPages","page.content",data);
      openForum.refreshPage("/OpenForum/DeletedPages");

      pageName = "/OpenForum/DeletedPages";

      openForum.buildPage(pageName,true);
    } else {
      file.appendStringToFile("/OpenForum/PublishingJournal","page.content","* Read Only Page "+pageName+" marked for deletion\n");
      openForum.buildPage("/OpenForum/PublishingJournal");
      pageName = "/OpenForum/PublishingJournal";
    }

    if(json) {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Deleted "+pageName,deleted: deleted}));
    }  else  {
      transaction.goToPage(pageName);
    }
  } else {
    try{
      openForum.deleteAttachment(pageName,fileName);
    } catch(e) {
    }

    var deleted = !(file.attachmentExists(pageName,fileName));
    if(deleted) {
      openForum.buildPage(pageName,true);
    } else {
      file.appendStringToFile("/OpenForum/PublishingJournal","page.content","* Read Only File "+pageName+"/"+fileName+ " marked for deletion\n");
      openForum.buildPage("/OpenForum/PublishingJournal");
      pageName = "/OpenForum/PublishingJournal";
    }

    if(json) {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Deleted "+pageName+"/"+fileName,deleted: deleted}));
    }  else  {
      transaction.goToPage(pageName);
    }
  }


} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error: "+e}));
  return;
}