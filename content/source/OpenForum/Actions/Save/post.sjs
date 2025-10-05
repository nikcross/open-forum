
try{
  transaction.getPostData();
  var json = false;
  var returnType = transaction.getParameter("returnType"); //If set as 'json', will return json response else will forward to pageName

  if(returnType!==null && (""+returnType)=="json") {
    json = true;
  }

  pageName = transaction.getPostParameter("pageName"); //The name of the page to save the file to
  transaction.userCanPerformAction(pageName,"update",true);

  fileName = transaction.getPostParameter("fileName"); //The name of the file to save
  data = transaction.getPostParameter("data"); //The data to save in the file
  user = transaction.getUser();

  openForum.saveAsAttachment(pageName,fileName,data,user);
  try{
    openForum.buildPage(pageName);
    
    file.appendStringToFileNoBackup("/OpenForum/Users/"+transaction.getUser(),"journal.txt","Changed file "+fileName+" on page "+pageName+" at "+new Date()+"\n");
  } catch(e) {
    //ignor as may not have page.content
  }

  if(json===false) {
    transaction.goToPage(pageName);
  } else {
    transaction.sendJSON( JSON.stringify({result: "ok",message: "Saved "+pageName+"/"+fileName, saved: true}));
  }
} catch(e) {

  transaction.sendJSON( JSON.stringify({result: "error",message: "Failed to save "+pageName+"/"+fileName+" Error:"+e+" on line "+e.lineNumber()+" of "+e.sourceName(), saved: false}));
}