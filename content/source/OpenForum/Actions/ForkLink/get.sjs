log.test("Got here");
var fileName = transaction.getParameter("fileName");
if( fileName === null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
log.test("Got here 2");
pageName = ""+pageName;
fileName = ""+fileName;
var newFileName = fileName.substring(0,fileName.indexOf(".link"));
var resourceName = ""+file.getAttachment(pageName,fileName,false);

var resourcePageName = resourceName.substring(0,resourceName.lastIndexOf("/"));
var resourceFileName = resourceName.substring(resourceName.lastIndexOf("/")+1);

log.test("Got here 3");
file.copyAttachment(resourcePageName,resourceFileName,pageName,newFileName);
file.deleteAttachmentNoBackup(pageName,fileName);

log.test("Got here 4");
var result = {
	pageName: pageName,
	fileName: fileName,
	resourceName: resourceName,
	newFileName: newFileName,
	resourcePageName: resourcePageName,
	resourceFileName: resourceFileName
};

log.test("Got here 5");
transaction.sendJSON( JSON.stringify(result) );
