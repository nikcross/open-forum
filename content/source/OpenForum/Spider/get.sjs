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
    config = config.replaceAll("\\\\n","\n");
    script = "config="+config+";\n"+ script;
  }
  script = "try{" + script + "} catch(e) { openForum.postMessageToQueue( \"/OpenForum/Spider\",\"\"+e); }";
  js.startJavascript("/OpenForum/Spider/spider.sjs",script);
  
  result = {result: "ok", message: "Started crawl based on config", config: ""+script};
} else if(action==="stop") {
openForum.postMessageToQueue( "/OpenForum/Spider","[STOP]");
  
	result = {result: "ok", message: "Stop crawl requested"};
}

transaction.sendJSON( JSON.stringify(result) );