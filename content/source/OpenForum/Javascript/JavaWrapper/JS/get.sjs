// Service for org.one.stone.soup.wiki.processor.JavascriptHelper 
var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action=="pageExists") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.pageExists(arg0) );
	return;
}
if(action=="getPageAttachmentAsString") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( js.getPageAttachmentAsString(arg0,arg1) );
	return;
}
if(action=="getApi") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.getApi(arg0) );
	return;
}
if(action=="getPageAttachmentAsXml") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.getPageAttachmentAsXml(arg0) );
	return;
}
if(action=="getPageAttachmentAsXml") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( js.getPageAttachmentAsXml(arg0,arg1) );
	return;
}
if(action=="getPageTags") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.getPageTags(arg0) );
	return;
}
if(action=="startJavascript") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.startJavascript(arg0) );
	return;
}
if(action=="getTemplateHelper") {
	transaction.sendPage( js.getTemplateHelper() );
	return;
}
if(action=="getStringAsXml") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.getStringAsXml(arg0) );
	return;
}
if(action=="refreshJarManager") {
	transaction.sendPage( js.refreshJarManager() );
	return;
}
if(action=="loadObject") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( js.loadObject(arg0,arg1) );
	return;
}
if(action=="getStringBuffer") {
	transaction.sendPage( js.getStringBuffer() );
	return;
}
if(action=="getObject") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( js.getObject(arg0,arg1) );
	return;
}
if(action=="sleep") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( js.sleep(arg0) );
	return;
}
