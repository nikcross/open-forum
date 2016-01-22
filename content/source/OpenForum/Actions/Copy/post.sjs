//DELETE ME
transaction.getPostData();
sourcePageName = transaction.getPostParameter("sourcePageName");
newPageName = transaction.getPostParameter("newPageName");
listPageName = transaction.getPostParameter("listPageName");

transaction.userCanPerformAction(newPageName,"update",true);
if(listPageName!=null)
{
  transaction.userCanPerformAction(listPageName,"update",true);
}

wiki.copyPage(sourcePageName,newPageName,listPageName);
	
transaction.goToPage("/OpenForum/Editor?pageName="+newPageName);