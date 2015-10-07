if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  result = wiki.validateWikiTitle(pageName);

  transaction.sendPage(result);
}