if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  var page = wiki.buildPage(pageName,"!!Folder: "+pageName+"\n !!ChildPages\n[{ChildPagesList}]\n !!Attachments\n[{AttachmentsList}]",true);
  transaction.sendPage( ""+page );
}