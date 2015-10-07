// Service for org.one.stone.soup.wiki.processor.OpenForumHelper 
var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action=="pageExists") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.pageExists(arg0) );
	return;
}
if(action=="rebuild") {
	transaction.sendPage( wiki.rebuild() );
	return;
}
if(action=="rebuild") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.rebuild(arg0) );
	return;
}
if(action=="validateWikiTitle") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.validateWikiTitle(arg0) );
	return;
}
if(action=="cleanUpQueues") {
	transaction.sendPage( wiki.cleanUpQueues() );
	return;
}
if(action=="getPageAsTable") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.getPageAsTable(arg0) );
	return;
}
if(action=="getDateTimeStamp") {
	transaction.sendPage( wiki.getDateTimeStamp() );
	return;
}
if(action=="getDateTimeStamp") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.getDateTimeStamp(arg0) );
	return;
}
if(action=="addJournalEntry") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.addJournalEntry(arg0) );
	return;
}
if(action=="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( wiki.buildPage(arg0,arg1,arg2) );
	return;
}
if(action=="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.buildPage(arg0) );
	return;
}
if(action=="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.buildPage(arg0,arg1) );
	return;
}
if(action=="buildPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.buildPage(arg0,arg1) );
	return;
}
if(action=="renderWikiData") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.renderWikiData(arg0,arg1) );
	return;
}
if(action=="buildEditPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.buildEditPage(arg0) );
	return;
}
if(action=="titleToWikiName") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.titleToWikiName(arg0) );
	return;
}
if(action=="buildPageSection") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.buildPageSection(arg0,arg1) );
	return;
}
if(action=="getPageUpdateTemplate") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.getPageUpdateTemplate(arg0) );
	return;
}
if(action=="deletePage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.deletePage(arg0) );
	return;
}
if(action=="deleteAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.deleteAttachment(arg0,arg1) );
	return;
}
if(action=="buildDifferencesPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( wiki.buildDifferencesPage(arg0,arg1,arg2) );
	return;
}
if(action=="buildHistoryPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.buildHistoryPage(arg0) );
	return;
}
if(action=="getPageAsList") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.getPageAsList(arg0) );
	return;
}
if(action=="revert") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.revert(arg0,arg1) );
	return;
}
if(action=="copyPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( wiki.copyPage(arg0,arg1,arg2) );
	return;
}
if(action=="addToListPage") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.addToListPage(arg0,arg1) );
	return;
}
if(action=="saveAsAttachment") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	var arg3 = transaction.getParameter("arg3");
	transaction.sendPage( wiki.saveAsAttachment(arg0,arg1,arg2,arg3) );
	return;
}
if(action=="setHomePage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.setHomePage(arg0) );
	return;
}
if(action=="createQueue") {
	transaction.sendPage( wiki.createQueue() );
	return;
}
if(action=="storeValue") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.storeValue(arg0,arg1) );
	return;
}
if(action=="retrieveValue") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.retrieveValue(arg0) );
	return;
}
if(action=="getMessagesSince") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.getMessagesSince(arg0,arg1) );
	return;
}
if(action=="wikiToTitleName") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.wikiToTitleName(arg0) );
	return;
}
if(action=="setUseCompression") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.setUseCompression(arg0) );
	return;
}
if(action=="setUseKeepAlive") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.setUseKeepAlive(arg0) );
	return;
}
if(action=="getTimeStamp") {
	transaction.sendPage( wiki.getTimeStamp() );
	return;
}
if(action=="getPages") {
	transaction.sendPage( wiki.getPages() );
	return;
}
if(action=="refreshPage") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( wiki.refreshPage(arg0) );
	return;
}
if(action=="postMessageToQueue") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	transaction.sendPage( wiki.postMessageToQueue(arg0,arg1) );
	return;
}
