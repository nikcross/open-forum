var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="appendLink") {
	var url = "" + transaction.getParameter("url");
    url = decodeURIComponent(url);
	var pageName = "" + transaction.getParameter("pageName");
  
  //Could access url and get title from meta data (and even an image)
  var link = "<a href='"+url+"' target='link'>"+url+"</a><br/>\n";
  
  file.appendStringToFileNoBackup(pageName,"page.content",link);
  openForum.refreshPage(pageName);
  
	transaction.goToPage(pageName);
}

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
