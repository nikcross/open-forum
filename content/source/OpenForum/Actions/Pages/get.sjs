var returnType = transaction.getParameter("returnType");
if(returnType==null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

var pages = wiki.getPages();
var data = "";
for(pageIndex in pages) {
  if(data.length>0) data+=",";
  data+="{pageName: \"" + pages[pageIndex] + "\"}";
}

data = "{pages: [" + data + "]}";

transaction.sendPage(data);