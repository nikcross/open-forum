if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	user = transaction.getUser();
	fileName = transaction.getParameter("fileName");
	viewName = transaction.getParameter("viewName");

	if(viewName==null)
	{
		viewName = "/OpenForum/Actions/GetAttachmentAsXml/default-view.xml";
	}

	xml = js.getPageAttachmentAsXml(pageName,fileName);
	xmlView = js.getPageAttachmentAsXml(viewName);
	page = js.getXmlAsJS(xml,xmlView);
	transaction.sendPage(page);
}