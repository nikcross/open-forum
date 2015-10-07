newPageName = transaction.getParameter("newPageName");

if(newPageName===null)
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	sourcePageName = ""+transaction.getParameter("sourcePageName");
	newPageName = ""+transaction.getParameter("newPageName");
	listPageName = transaction.getParameter("listPageName");
	if(listPageName!==null) {
		transaction.userCanPerformAction(listPageName,"update",true);
	}

	transaction.userCanPerformAction(newPageName,"update",true); 

	wiki.copyPage(sourcePageName,newPageName,listPageName);

	transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);
}