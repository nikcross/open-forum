// Service for org.one.stone.soup.wiki.processor.JavascriptFileHelper 
var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action=="deleteAttachmentNoBackup") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.deleteAttachmentNoBackup(arg0,arg1) );
	return;
}
if(action=="getAttachmentTimestamp") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getAttachmentTimestamp(arg0,arg1) );
	return;
}
if(action=="getAttachmentsForPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.getAttachmentsForPage(arg0) );
	return;
}
if(action=="saveAttachmentNoBackup") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.saveAttachmentNoBackup(arg0,arg1,arg2) );
	return;
}
if(action=="incrementAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.incrementAttachment(arg0,arg1) );
	return;
}
if(action=="unZipAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.unZipAttachment(arg0,arg1) );
	return;
}
if(action=="appendStringToFileNoBackup") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.appendStringToFileNoBackup(arg0,arg1,arg2) );
	return;
}
if(action=="appendStringToFile") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.appendStringToFile(arg0,arg1,arg2) );
	return;
}
if(action=="getAttachmentSize") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getAttachmentSize(arg0,arg1) );
	return;
}
if(action=="attachmentExists") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.attachmentExists(arg0,arg1) );
	return;
}
if(action=="getPageInheritedFilePath") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getPageInheritedFilePath(arg0,arg1) );
	return;
}
if(action=="zipPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.zipPage(arg0) );
	return;
}
if(action=="getAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.getAttachment(arg0,arg1,arg2) );
	return;
}
if(action=="getAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getAttachment(arg0,arg1) );
	return;
}
if(action=="isImageAttachment") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.isImageAttachment(arg0) );
	return;
}
if(action=="pageExists") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.pageExists(arg0) );
	return;
}
if(action=="getAttachmentOutputStream") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getAttachmentOutputStream(arg0,arg1) );
	return;
}
if(action=="getPageInheritedFileAsString") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getPageInheritedFileAsString(arg0,arg1) );
	return;
}
if(action=="getAttachmentInputStream") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getAttachmentInputStream(arg0,arg1) );
	return;
}
if(action=="copyAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	var arg3 = transaction.getParameter("arg3");
	transaction.sendPage( file.copyAttachment(arg0,arg1,arg2,arg3) );
	return;
}
if(action=="appendToPageSource") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.appendToPageSource(arg0,arg1) );
	return;
}
if(action=="saveAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.saveAttachment(arg0,arg1,arg2) );
	return;
}
