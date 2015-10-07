if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  wiki.deleteAttachment( pageName,"header.html.template.link" );
  wiki.deleteAttachment( pageName,"footer.html.template.link" );
  wiki.buildPage( pageName );
  transaction.goToPage( pageName );
}