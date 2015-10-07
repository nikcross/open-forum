if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	version1 = transaction.getParameter("version1");
	version2 = transaction.getParameter("version2");

	page = wiki.buildDifferencesPage(pageName,version1,version2);
	transaction.sendPage(page);
}