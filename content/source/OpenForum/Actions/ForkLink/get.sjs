var fileName = transaction.getParameter("fileName");
if( fileName === null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try {
  pageName = ""+pageName;
  fileName = ""+fileName;
  var newFileName = fileName.substring(0,fileName.indexOf(".link"));
  var resourceName = ""+file.getAttachment(pageName,fileName,false);

  var resourcePageName = resourceName.substring(0,resourceName.lastIndexOf("/"));
  var resourceFileName = resourceName.substring(resourceName.lastIndexOf("/")+1);

  file.copyAttachment(resourcePageName,resourceFileName,pageName,newFileName);
  file.deleteAttachmentNoBackup(pageName,fileName);

  var result = {
    pageName: pageName,
    fileName: fileName,
    resourceName: resourceName,
    newFileName: newFileName,
    resourceName: resourceName,
    resourcePageName: resourcePageName,
    resourceFileName: resourceFileName
  };

  transaction.sendJSON( JSON.stringify(result) );
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e}));
  return;
}
