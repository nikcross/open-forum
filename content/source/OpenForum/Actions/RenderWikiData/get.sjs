if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  data = transaction.getParameter("data");
  if(data==null)
  {
    sourcePageName = transaction.getParameter("sourcePageName");
    fileName = transaction.getParameter("fileName");
    data = file.getAttachment(sourcePageName,fileName);
  }

  html = wiki.renderWikiData(pageName,data);
  transaction.sendPage(html);
}