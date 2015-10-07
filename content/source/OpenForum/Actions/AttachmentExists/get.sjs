if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  fileName = transaction.getParameter("fileName");
  exists = file.attachmentExists(pageName,fileName);

  transaction.sendPage(exists);
}
