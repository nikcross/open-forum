if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  page = wiki.buildPage(pageName,"!!Folder: "+pageName,true);
  transaction.sendPage( page );
}