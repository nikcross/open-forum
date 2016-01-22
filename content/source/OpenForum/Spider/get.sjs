var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="crawl") {
  
  var script = file.getAttachment("/OpenForum/Spider","spider.sjs");
  var config = transaction.getParameter("config");
  if(config!==null) {
    script = "config="+config+";\n"+ script;
  }
  js.startJavascript("/OpenForum/Spider/spider.sjs",script);
  
	result = {result: "ok", message: "Started crawl based on config"};
} else if(action==="stop") {
openForum.postMessageToQueue( "/OpenForum/Spider","[STOP]");
  
	result = {result: "ok", message: "Stop crawl requested"};
}

transaction.sendJSON( JSON.stringify(result) );