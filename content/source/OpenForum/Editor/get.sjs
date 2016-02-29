var pageName = ""+transaction.getParameter("pageName");

if(transaction.userCanPerformAction(pageName,"edit",false)===false) {
  transaction.goToPage("/OpenForum/Access/SignIn?forwardTo=/OpenForum/Editor?pageName="+pageName);
  return;
}

var action = transaction.getParameter("action");
if(action!==null && ""+action==="getUpdates") {
  var user = ""+transaction.getUser();
  var lastCheckTime = parseInt(transaction.getParameter("lastCheckTime"),10);
  
  var changedFiles = [];
  var attachments = js.getObject("/OpenForum/Actions/Attachments","Attachments.sjs");
  var items = attachments.getList(pageName);
  for(var index in items) {
  var fileName = items[index];
    try{
      var lastModified = parseInt( file.getAttachmentTimestamp(pageName,fileName),10 );
      if(lastModified<=lastCheckTime) {
        continue;
      }
      
      var entry = {pageName: pageName, fileName: fileName, lastModified: lastModified};
      changedFiles.push(entry);
    } catch(e) {}
  }
  
  result = {user: user, pageName: ""+pageName, lastCheckTime: lastCheckTime, changedFiles: changedFiles};
  
  transaction.sendJSON( JSON.stringify(result) );
  return;
}

var editor = transaction.getParameter("editor");
if(editor!==null && ""+editor!=="/OpenForum/Editor") {
    transaction.goToPage(""+editor+"?pageName="+pageName+"&overrideEditor=true");
    return;
}

var overrideEditor = transaction.getParameter("overrideEditor");
if(overrideEditor===null) {
try{
  var data = js.getObject("/OpenForum/Javascript/Page","Data.js").getData(pageName);
  if(data.getEditor() && ""+data.getEditor()!=="/OpenForum/Editor") {

    transaction.goToPage(data.getEditor()+"?pageName="+pageName);
    return;
  }
} catch(e) {
}
}
  
transaction.setResult(transaction.SHOW_PAGE);
