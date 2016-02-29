var targetPage = transaction.getParameter("pageName");
var matching = transaction.getParameter("matching");

if(targetPage===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
targetPage = ""+ targetPage;

var list = file.getAttachmentsForPage(targetPage);

var metaData = transaction.getParameter("metaData");


var attachments = js.getObject("/OpenForum/Actions/Attachments","Attachments.sjs");
var items = attachments.getList(targetPage,matching);

var data = {attachments: [], length: items.length, pageName: targetPage};
var totalSize = 0;
var lastModified = 0;

for(var index in items) {
  var fileName = items[index];
  var entry = {pageName: targetPage, fileName: fileName};

  if(metaData!==null) {
    try{
      entry.lastModified = parseInt( file.getAttachmentTimestamp(targetPage,fileName),10 );
      entry.size = parseInt( file.getAttachmentSize(targetPage,fileName),10 );
      
      totalSize += entry.size;
      if(lastModified===0 || lastModified<entry.lastModified) {
        lastModified=entry.lastModified;
      }
    } catch(e) {
      entry.error = ""+e;
    }
  }

  data.attachments.push( entry ) ;
}

  if(metaData!==null) {
      data.lastModified = lastModified;
      data.size = totalSize;
  }

transaction.sendPage(JSON.stringify(data));