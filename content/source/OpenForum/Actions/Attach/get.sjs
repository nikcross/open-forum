var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action==="upload") {

    var url = ""+transaction.getParameter("url");
    var pageName = ""+transaction.getParameter("pageName");
    var fileName = ""+transaction.getParameter("fileName");

    try{
      external.getURLAsFile( url,pageName,fileName );  
      result = {result: "ok", message: "Uploaded "+url+" to "+pageName+"/"+fileName };
    } catch (e) {
      transaction.sendJSON( JSON.stringify({result: "error",message: "Failed to upload "+url+ " to " +pageName+"/"+fileName+" "+e}));
    }
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error: "+e}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
