var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action==="save") {
    var dec = Packages.javax.xml.bind.DatatypeConverter;

    var data = transaction.getParameter("data");
    data = data.substring(data.indexOf(",")+1);
    data = data.replaceAll(" ","+");
    
    var fileName = transaction.getParameter("fileName");
    var pageName = transaction.getParameter("pageName");

    var outStream = file.getAttachmentOutputStream(pageName,fileName);
    outStream.write( Packages.java.util.Base64.getMimeDecoder().decode(data.trim().getBytes("UTF-8")) );
    outStream.flush();
    outStream.close();

    result = {result: "ok", message: "Saved "+pageName+"/"+fileName};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
