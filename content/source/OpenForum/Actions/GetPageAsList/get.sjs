if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	varName = transaction.getParameter( "varName" );

	arrayData = wiki.getPageAsList(pageName);
	arrayJs = js.get2DArrayAsJavascript( varName,arrayData);
	transaction.sendPage(arrayJs);
}