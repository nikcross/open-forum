if(typeof(pageName)=="undefined")
{
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

transaction.userCanPerformAction(pageName,"delete",true); 
fileName = transaction.getParameter("fileName");

  var json = false;
  var returnType = transaction.getParameter("returnType");

  if(returnType!==null && (""+returnType)=="json") {
    json = true;
  }

if( fileName===null ) {
  openForum.deletePage(pageName);

  //TODO Handle pages deleted from /OpenForum/DeletedPages
  data = file.getAttachment("/OpenForum/DeletedPages","page.content");
  data = data + "\n*[Undelete "+pageName+"|/OpenForum/Actions/Move?pageName=/OpenForum/DeletedPages/"+pageName+"&newPageName="+pageName+"]";
  file.saveAttachment("/OpenForum/DeletedPages","page.content",data);
  openForum.refreshPage("/OpenForum/DeletedPages");

  pageName = "/OpenForum/DeletedPages";

  openForum.buildPage(pageName,true);
  if(json) {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Deleted "+pageName,deleted: true}));
  }  else  {
    transaction.goToPage(pageName);
  }
} else {
  openForum.deleteAttachment(pageName,fileName);
  openForum.buildPage(pageName,true);

  if(json) {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Deleted "+pageName+"/"+fileName,deleted: true}));
  }  else  {
    transaction.goToPage(pageName);
  }
}
