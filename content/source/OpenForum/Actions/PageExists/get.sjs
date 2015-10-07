if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  fileName = transaction.getParameter("pageName");
  exists = file.pageExists(pageName);

  transaction.sendPage(exists);
}
