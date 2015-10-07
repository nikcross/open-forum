if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	version = transaction.getParameter("version");
	wiki.revert(pageName,version);

	transaction.goToPage(pageName);
}