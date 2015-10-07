var targetPage = transaction.getParameter("pageName");
var matching = transaction.getParameter("matching");

if(targetPage===null) {
      transaction.setResult(transaction.SHOW_PAGE);
    return;
}
targetPage = ""+ targetPage;

var list = file.getAttachmentsForPage(targetPage);

var attachments = js.getObject("/OpenForum/Actions/Attachments","Attachments.sjs");
var items = attachments.getList(targetPage,matching);

var data = {attachments: [], length: items.length};
for(var index in items) {
  data.attachments.push( {pageName: targetPage, fileName: items[index]} ) ;
}

transaction.sendPage(JSON.stringify(data));