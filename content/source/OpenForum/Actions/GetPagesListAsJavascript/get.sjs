if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	pages = wiki.getPages();
	page = js.getArrayAsJavascript("pages",pages);
	transaction.sendPage(page);
}