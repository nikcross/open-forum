var pageName = transaction.getParameter("pageName");

if(transaction.userCanPerformAction(""+pageName,"edit",false)===false) {
  transaction.goToPage("/OpenForum/Access/SignIn?forwardTo=/OpenForum/Editor?pageName="+pageName);
  return;
}

var editor = transaction.getParameter("editor");

if(editor===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}
editor = ""+editor;
