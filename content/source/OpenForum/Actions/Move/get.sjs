if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}
	newPageName = transaction.getParameter("newPageName");
	wiki.copyPage(pageName,newPageName,null);
	wiki.deletePage(pageName);
	transaction.goToPage(newPageName); 
