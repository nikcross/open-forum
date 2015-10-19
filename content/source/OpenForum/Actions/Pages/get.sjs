var returnType = transaction.getParameter("returnType");
if(returnType==null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

var pages = wiki.getPages();
var data = {pages: []};
for(pageIndex in pages) {
  data.pages.push({pageName: ""+pages[pageIndex]});
}

transaction.sendPage("{}");
//transaction.sendPage( JSON.stringify(data) );
