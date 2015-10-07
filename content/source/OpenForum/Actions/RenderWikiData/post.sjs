transaction.getPostData();

data = transaction.getPostParameter("data");
pageName = transaction.getPostParameter("pageName");
  if(data==null)
  {
    sourcePageName = transaction.getPostParameter("sourcePageName");
    fileName = transaction.getPostParameter("fileName");
    data = file.getAttachment(sourcePageName,fileName);
  }

  html = wiki.renderWikiData(pageName,data);
  transaction.sendPage(html);