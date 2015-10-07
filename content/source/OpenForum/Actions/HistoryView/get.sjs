if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	user = transaction.getUser();
	page = wiki.buildHistoryPage(pageName);
	transaction.sendPage(page);
}