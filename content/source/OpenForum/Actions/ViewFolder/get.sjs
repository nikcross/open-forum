if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  page = wiki.buildPage(pageName,"!!Folder: "+pageName+"<br/> !!ChildPages<br/>[{ChildPagesList}]<br/> !!Attachments<br/>[{AttachmentsList}]",true);
  transaction.sendPage( page );
}