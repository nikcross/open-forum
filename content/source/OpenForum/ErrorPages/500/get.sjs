if(typeof(exception) === "undefined") {
  exception = "Test Exception";
}

var json = transaction.getParameter("json");
if(json!==null) {
  exception = ""+exception.replace(/<\/br>/g,"\n");
  result = {result: "Error", exception: exception};
  transaction.sendJSON(JSON.stringify(result));
}
page = ""+wiki.buildPage("/OpenForum/ErrorPages/500",exception,false).toString();
transaction.sendPage(page);
