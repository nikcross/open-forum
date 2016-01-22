var pageName = transaction.getParameter("pageName");

if(transaction.userCanPerformAction(""+pageName,"edit",false)===false) {
  transaction.goToPage("/OpenForum/Access/SignIn?forwardTo=/OpenForum/Editor?pageName="+pageName);
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
