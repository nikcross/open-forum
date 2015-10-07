var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action==="pageExists") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.pageExists(arg0) );
	return;
}
if(action==="rebuild") {
	transaction.sendPage( file.rebuild() );
	return;
}
if(action==="rebuild") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.rebuild(arg0) );
	return;
}
if(action==="validateWikiTitle") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.validateWikiTitle(arg0) );
	return;
}
if(action==="cleanUpQueues") {
	transaction.sendPage( file.cleanUpQueues() );
	return;
}
if(action==="getPageAsTable") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.getPageAsTable(arg0) );
	return;
}
if(action==="getDateTimeStamp") {
	transaction.sendPage( file.getDateTimeStamp() );
	return;
}
if(action==="getDateTimeStamp") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.getDateTimeStamp(arg0) );
	return;
}
if(action==="addJournalEntry") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.addJournalEntry(arg0) );
	return;
}
if(action==="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.buildPage(arg0,arg1,arg2) );
	return;
}
if(action==="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.buildPage(arg0) );
	return;
}
if(action==="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.buildPage(arg0,arg1) );
	return;
}
if(action==="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.buildPage(arg0,arg1) );
	return;
}
if(action==="renderWikiData") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.renderWikiData(arg0,arg1) );
	return;
}
if(action==="buildEditPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.buildEditPage(arg0) );
	return;
}
if(action==="titleToWikiName") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.titleToWikiName(arg0) );
	return;
}
if(action==="buildPageSection") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.buildPageSection(arg0,arg1) );
	return;
}
if(action==="getPageUpdateTemplate") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.getPageUpdateTemplate(arg0) );
	return;
}
if(action==="deletePage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.deletePage(arg0) );
	return;
}
if(action==="deleteAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.deleteAttachment(arg0,arg1) );
	return;
}
if(action==="buildDifferencesPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.buildDifferencesPage(arg0,arg1,arg2) );
	return;
}
if(action==="buildHistoryPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.buildHistoryPage(arg0) );
	return;
}
if(action==="getPageAsList") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.getPageAsList(arg0) );
	return;
}
if(action==="revert") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.revert(arg0,arg1) );
	return;
}
if(action==="copyPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( file.copyPage(arg0,arg1,arg2) );
	return;
}
if(action==="addToListPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.addToListPage(arg0,arg1) );
	return;
}
if(action==="saveAsAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	var arg3 = transaction.getParameter("arg3");
	transaction.sendPage( file.saveAsAttachment(arg0,arg1,arg2,arg3) );
	return;
}
if(action==="setHomePage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.setHomePage(arg0) );
	return;
}
if(action==="createQueue") {
	transaction.sendPage( file.createQueue() );
	return;
}
if(action==="storeValue") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.storeValue(arg0,arg1) );
	return;
}
if(action==="retrieveValue") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.retrieveValue(arg0) );
	return;
}
if(action==="getMessagesSince") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.getMessagesSince(arg0,arg1) );
	return;
}
if(action==="wikiToTitleName") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.wikiToTitleName(arg0) );
	return;
}
if(action==="setUseCompression") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.setUseCompression(arg0) );
	return;
}
if(action==="setUseKeepAlive") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.setUseKeepAlive(arg0) );
	return;
}
if(action==="getTimeStamp") {
	transaction.sendPage( file.getTimeStamp() );
	return;
}
if(action==="getPages") {
	transaction.sendPage( file.getPages() );
	return;
}
if(action==="refreshPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( file.refreshPage(arg0) );
	return;
}
if(action==="postMessageToQueue") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( file.postMessageToQueue(arg0,arg1) );
	return;
}
