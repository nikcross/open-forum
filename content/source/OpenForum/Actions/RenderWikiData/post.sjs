transaction.getPostData();

data = transaction.getPostParameter("data");
pageName = transaction.getPostParameter("pageName");
  if(data===null)
  {
    sourcePageName = transaction.getPostParameter("sourcePageName");
    fileName = transaction.getPostParameter("fileName");
    data = file.getAttachment(sourcePageName,fileName);
  }

  var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");
  var html = renderer.render(pageName,data);

  if(transaction.getParameter("json")===null) {
    transaction.sendPage(html);
  } else {
    transaction.sendJSON( JSON.stringify(html) );
  }