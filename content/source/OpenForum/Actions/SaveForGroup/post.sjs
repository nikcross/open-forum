transaction.getPostData();
var json = false;
var returnType = transaction.getParameter("returnType");
if(returnType!==null && (""+returnType)=="json") {
  json = true;
}

	var user = ""+transaction.getUser();		
    var group = transaction.getParameter("group");
    var pageName = "/OpenForum/Groups/" + group + "/" + transaction.getParameter("pageName");
    transaction.userCanPerformAction(pageName,"update",true);

    var fileName = transaction.getPostParameter("fileName");
    var data = transaction.getPostParameter("data");

openForum.saveAsAttachment(pageName,fileName,data,user);
openForum.buildPage(pageName);

if(json===false) {
  transaction.goToPage(pageName);
} else {
  transaction.sendPage("{saved: true}");
}