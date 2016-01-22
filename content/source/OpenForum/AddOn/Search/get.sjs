var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};


if(action==="rebuildSearchIndex") {
  var script = file.getAttachment("/OpenForum/Spider","spider.sjs");
  var config = file.getAttachment("/OpenForum/AddOn/Search","spider.config");
  script = "config="+config+";\n"+ script;
  
  js.startJavascript("/OpenForum/Spider/spider.sjs",script);
  
  result = {result: "ok", message: "Started rebuilding search index"};
}

transaction.sendJSON( JSON.stringify(result) );
