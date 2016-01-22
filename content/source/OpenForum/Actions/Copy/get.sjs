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

    if(json===false) {
      transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);
    } else {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Copied "+pageName+"/"+fileName+" to "+newPageName+"/"+newFileName,copied: true}));
    }

  } else {
    wiki.copyPage(pageName,newPageName,null);
    if(json===false) {
      transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);
    } else {
      transaction.sendJSON(JSON.stringify({result: "ok", message: "Copied "+pageName+" to "+newPageName,copied: true}));
    }
  }
} catch(e) {
  transaction.sendJSON(JSON.stringify({result: "error", message: ""+e}));
}