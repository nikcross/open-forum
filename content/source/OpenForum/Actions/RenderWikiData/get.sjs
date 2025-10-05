if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  var data = transaction.getParameter("data");
  if(data===null)
  {
    sourcePageName = transaction.getParameter("sourcePageName");
    fileName = transaction.getParameter("fileName");
    data = file.getAttachment(sourcePageName,fileName);
  }

  var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");
  var html = renderer.render(pageName,data);

  if(transaction.getParameter("json")===null) {
    transaction.sendPage(html);
  } else {
    transaction.sendJSON( JSON.stringify(html) );
  }
}