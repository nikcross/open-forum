transaction.getPostData();
var json = false;
var returnType = transaction.getParameter("returnType");
if(returnType!=null && (""+returnType)=="json") {
  json = true;
}

pageName = transaction.getPostParameter("pageName");
transaction.userCanPerformAction(pageName,"update",true);

fileName = transaction.getPostParameter("fileName");
data = transaction.getPostParameter("data");
user = transaction.getUser();

wiki.saveAsAttachment(pageName,fileName,data,user);
wiki.buildPage(pageName);

if(json==false) {
  transaction.goToPage(pageName);
} else {
  transaction.sendPage("{saved: true}");
}