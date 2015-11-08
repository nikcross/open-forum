var pageName = transaction.getParameter("pageName");
if( pageName===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+transaction.getParameter("action");
  result = "";
  
  if(action === "zip" || action === "null") {
    
    file.zipPage( pageName );
	wiki.buildPage( pageName );

    var fileName = pageName.substring(pageName.lastIndexOf("/"))+".wiki.zip";
	transaction.goToPage( pageName+"/"+fileName );
    return;
  } else if(action === "unzip") {
	var fileName = transaction.getParameter("fileName");
    
    file.unZipAttachment(pageName,fileName);
    
    result = JSON.stringify({result: "ok"});
  } else {
      result = "action not recognised";
  }

  transaction.sendPage( result );
