var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

  if(action === "getCurrentUser") {
	var user = transaction.getUser();
    result = user;
    
  } else  if(action === "getCurrentUserProfile") {
	var user = transaction.getUser();
    var userProfilePage = "/OpenForum/Users/"+user+"/public";
    var profile = {};
    if(file.attachmentExists( userProfilePage,"profile.json" )) {
      profile = JSON.parse( ""+file.getAttachment( userProfilePage,"profile.json" ) );
    }
   
    result = {result: "ok", message: "Performed action "+action, profile: profile};
  }
  
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );