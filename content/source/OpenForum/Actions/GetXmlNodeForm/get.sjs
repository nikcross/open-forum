if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	fileName = transaction.getParameter("fileName");
	viewName = transaction.getParameter("viewName");
	nodePath = transaction.getParameter("nodePath");
	
	xml = js.getPageAttachmentAsXml(pageName,fileName);
	xmlView = js.getPageAttachmentAsXml(viewName);

	data = js.getXmlNodeForm( xml,xmlView,nodePath );

	transaction.sendPage( data );
}