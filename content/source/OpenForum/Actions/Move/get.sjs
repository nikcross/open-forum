if(typeof(pageName)=="undefined") {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
try{
  var json = false;
  var returnType = transaction.getParameter("returnType");

  if(returnType!==null && (""+returnType)=="json") {
    json = true;
  }

  var newPageName = transaction.getParameter("newPageName");
  var fileName = transaction.getParameter("fileName");
  var newFileName = transaction.getParameter("newFileName");

  if(newPageName===null) {
    newPageName = pageName;
  } else {
    newPageName = ""+newPageName;
  }

  transaction.userCanPerformAction(newPageName,"update",true);

  if(fileName!==null) {
    fileName = ""+fileName;
    if(newFileName===null) {
      newFileName = fileName;
    } else {
      newFileName = ""+newFileName;
    }

    if(fileName===newFileName && pageName===newPageName) {
      return;
    }

    var data = file.getAttachment(pageName,fileName);
    file.saveAttachment(newPageName,newFileName,data);
    file.deleteAttachmentNoBackup(pageName,fileName);

    if(json===false) {
      transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);
    } else {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Moved "+pageName+"/"+fileName+" to "+newPageName+"/"+newFileName,moved: true}));
    }

  } else {
    wiki.copyPage(pageName,newPageName,null);
    wiki.deletePage(pageName);
    if(json===false) {
      transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);
    } else {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Moved "+pageName+" to "+newPageName,moved: true}));
    }
  }
} catch(e) {
  transaction.sendJSON(JSON.stringify({result: "error", message: ""+e}));
}