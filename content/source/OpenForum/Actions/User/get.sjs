var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action === "getCurrentUser") {
    var userName = ""+transaction.getUser();
    var currentPage = transaction.getParameter("currentPage");
    
    if(currentPage!==null) {
      var Users = js.getObject("/OpenForum/Actions/User","Users.sjs");
      var user = Users.getUser(userName);
      if(userName!="Guest") {
      	user.updatePageHistory(""+currentPage);
      }
    }
    
    result = userName;

  } else  if(action === "getCurrentUserProfile") {
    var userName = ""+transaction.getUser();
    var userProfilePage = "/OpenForum/Users/"+userName+"/public";
    var profile = {};
    if(file.attachmentExists( userProfilePage,"profile.json" )) {
      profile = JSON.parse( ""+file.getAttachment( userProfilePage,"profile.json" ) );
    }


    var Users = js.getObject("/OpenForum/Actions/User","Users.sjs");
    var user = Users.getUser(userName);
    profile.pageHistory = user.getSortedPageHistory(10);

    result = {result: "ok", message: "Performed action "+action, profile: profile};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );