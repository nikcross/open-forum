if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	fileName = transaction.getParameter("fileName");
	varName = transaction.getParameter("varName");

	xml = js.getPageAttachmentAsXml(pageName,fileName);
	page = js.getXmlAsJavascript(varName,xml);
	transaction.sendPage(page);
}