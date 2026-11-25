// Service for org.one.stone.soup.wiki.processor.JavascriptFileHelper 
var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  if(action=="deleteAttachmentNoBackup") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.deleteAttachmentNoBackup(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachmentTimestamp") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getAttachmentTimestamp(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachmentsForPage") {
    var arg0 = transaction.getParameter("arg0");
    file.getAttachmentsForPage(arg0);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="saveAttachmentNoBackup") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    file.saveAttachmentNoBackup(arg0,arg1,arg2);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="incrementAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.incrementAttachment(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="unZipAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.unZipAttachment(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="appendStringToFileNoBackup") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    file.appendStringToFileNoBackup(arg0,arg1,arg2);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="appendStringToFile") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    file.appendStringToFile(arg0,arg1,arg2);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachmentSize") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getAttachmentSize(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="attachmentExists") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.attachmentExists(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getPageInheritedFilePath") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getPageInheritedFilePath(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="zipPage") {
    var arg0 = transaction.getParameter("arg0");
    file.zipPage(arg0);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    file.getAttachment(arg0,arg1,arg2);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getAttachment(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="isImageAttachment") {
    var arg0 = transaction.getParameter("arg0");
    file.isImageAttachment(arg0);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="pageExists") {
    var arg0 = transaction.getParameter("arg0");
    file.pageExists(arg0);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachmentOutputStream") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getAttachmentOutputStream(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getPageInheritedFileAsString") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getPageInheritedFileAsString(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="getAttachmentInputStream") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.getAttachmentInputStream(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="copyAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    var arg3 = transaction.getParameter("arg3");
    file.copyAttachment(arg0,arg1,arg2,arg3);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="appendToPageSource") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    file.appendToPageSource(arg0,arg1);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else if(action=="saveAttachment") {
    var arg0 = transaction.getParameter("arg0");
    var arg1 = transaction.getParameter("arg1");
    var arg2 = transaction.getParameter("arg2");
    file.saveAttachment(arg0,arg1,arg2);
    transaction.sendJSON( JSON.stringify({result: "ok"}) );
  } else {
    transaction.sendJSON( JSON.stringify({result: "error", message: "Action "+action+" not recognised."}) );

  }
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
}
