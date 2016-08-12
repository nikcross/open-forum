var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
action = ""+action;

if(action==="getPageTree") {
  var targetPage = ""+transaction.getParameter("pageName");
  list = file.getAttachmentsForPage( targetPage );
  if(targetPage.charAt(0)!='/')
  {
    targetPage = "/"+targetPage;
  }

  try{
    var replaceTime = new Date().getTime()-3600000;
    var treeData = null;
    var cacheFileName = "tree-"+pageName.replace(/\//g,"-")+".cached.js";
    if( transaction.getParameter("refresh")===null && (file.attachmentExists("/OpenForum/Javascript/Tree",cacheFileName) && file.getAttachmentTimestamp("/OpenForum/Javascript/Tree",cacheFileName)>replaceTime) ) {
      treeData = file.getAttachment("/OpenForum/Javascript/Tree",cacheFileName);
    } else {
      var tree = js.getObject("/OpenForum/Javascript/Tree","Tree.sjs");
      treeData = JSON.stringify( tree.createFileTree(targetPage) );
      //TODO Fix this
      try{
      file.saveAttachment("/OpenForum/Javascript/Tree",cacheFileName,treeData);
      } catch(e) {}
    }
    transaction.sendPage( treeData );
  } catch(e) {
    transaction.sendPage(e);
  }
}