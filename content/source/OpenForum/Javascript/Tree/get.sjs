var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
try{

  action = ""+action;

  if(action==="getPageTree") {
    var targetPage = ""+transaction.getParameter("pageName");
    if(targetPage.charAt(0)!='/') {
      targetPage = "/"+targetPage;
    }
    var matcher = transaction.getParameter("match");
    if(matcher!=null) matcher = "" + matcher;

    var pageOffset = transaction.getParameter("pageOffset");
    if(pageOffset==null) {
      pageOffset = 0;
    } else {
      pageOffset = parseInt(""+pageOffset,10);
    }

    var fileOffset = transaction.getParameter("fileOffset");
    if(fileOffset==null) {
      fileOffset = 0;
    }  else {
      fileOffset = parseInt(""+fileOffset,10);
    }

    var treeData = null;
    var tree = js.getObject("/OpenForum/Javascript/Tree","Tree.sjs");
    treeData = JSON.stringify( tree.createFileTree(targetPage,matcher,fileOffset,pageOffset) );   

    transaction.sendJSON( treeData );
  }
}catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber}));
}
