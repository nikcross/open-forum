var pageName = transaction.getParameter("pageName");
if(pageName===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

list = file.getAttachmentsForPage( pageName );

var pagesList = [];
iterator= list.keySet().iterator();
while(iterator.hasNext()) {
  var key = ""+iterator.next();
  if(key.charAt(0)!='+' || key=="+history") {
    continue;
  } else {
    pagesList.push( pageName+"/"+key.substring(1) );
  }
}
pagesList.sort();

//transaction.sendPage("{}");
transaction.sendPage( JSON.stringify(pagesList) );
