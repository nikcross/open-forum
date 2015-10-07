if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  fileName = transaction.getParameter( "fileName" );

  data = file.incrementAttachment( pageName,fileName );
  transaction.sendPage(data);
}