if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	user = transaction.getUser();
	files = file.getAttachmentsForPage(pageName);
	page = js.getAttachmentsJS(pageName,files);
	transaction.sendPage(page);
}