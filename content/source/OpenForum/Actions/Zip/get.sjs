var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  var pageName = ""+transaction.getParameter("pageName");
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action === "zip") {

    file.zipPage( pageName );
    wiki.buildPage( pageName );

    var fileName = pageName.substring(pageName.lastIndexOf("/"))+".wiki.zip";
    transaction.goToPage( pageName+"/"+fileName );
    return;
  } else if(action === "unzip") {
    var fileName = transaction.getParameter("fileName");

    file.unZipAttachment(pageName,fileName);

    result = JSON.stringify({result: "ok"});
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
