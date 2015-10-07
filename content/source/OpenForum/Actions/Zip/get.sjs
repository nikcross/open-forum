var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "zip") {
	var pageName = transaction.getParameter("pageName");
    
    file.zipPage( pageName );
	wiki.buildPage( pageName );

    var fileName = pageName.substring(pageName.lastIndexOf("/"))+".wiki.zip";
	transaction.goToPage( pageName+"/"+fileName );
    return;
  } else if(action === "unzip") {
	var pageName = transaction.getParameter("pageName");
	var fileName = transaction.getParameter("fileName");
    
    file.unZipAttachment(pageName,fileName);
    
    result = JSON.stringify({result: "ok"});
  } else {
      result = "action not recognised";
  }

  transaction.sendPage( result );
