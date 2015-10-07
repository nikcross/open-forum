if(typeof(exception) === "undefined") {
  exception = "Test Exception";
}

var json = transaction.getParameter("json");
if(json!==null) {
  exception = exception.replace(/<\/br>/g,"\n");
  result = {result: "Error", exception: exception};
  transaction.sendPage(JSON.stringify(result));
}
page = wiki.buildPage("Error",exception,false);
transaction.sendPage(page);