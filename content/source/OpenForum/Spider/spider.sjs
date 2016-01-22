function logSpiderMessage(message) {
  openForum.postMessageToQueue( "/OpenForum/Spider",message);
}

logSpiderMessage("Running /OpenForum/Spider/spider.sjs");
if(typeof(config)==="undefined") {
    config = JSON.parse( file.getAttachment("/OpenForum/Spider","spider.config.json"));
}
  logSpiderMessage("Config: "+JSON.stringify(config));

var processors = [];
for(var i=0;i<config.processors.length;i++) {
  logSpiderMessage("Adding processor " + config.processors[i].page + "/" + config.processors[i].file);
  var processor =  js.getObject(config.processors[i].page,config.processors[i].file);
  processor.setLog( logSpiderMessage );
  processors.push( processor );
}

var lastTime = ""+new Date().getTime();
var isStopRequested = false;
function stopRequested() {
  if(isStopRequested) return true;
  
  var messages = openForum.getMessagesSince("/OpenForum/Spider", lastTime);
  for(var  i=0;i<messages.length;i++) {
    if(messages[i].indexOf("[STOP]")!=-1) {
       isStopRequested=true;
       logSpiderMessage("Stop Reuqested. Will stop processing pages.");
       return true;
       }
  }
  
  lastTime = ""+new Date().getTime();
  return false;
}

function crawl(targetPage) {
  if(stopRequested()) {
    return;
  }
  
  var list = file.getAttachmentsForPage( targetPage );
  if(targetPage.charAt(0)!='/') {
    targetPage = "/"+targetPage;
  }

  var iterator= list.keySet().iterator();
  while(iterator.hasNext()) {
    var key = ""+iterator.next();
    if(key.charAt(0)!='+') {
      processFile(targetPage,key);
    } else {
      var pageName = key.substring(1);
      crawl(targetPage+"/"+pageName);
    }
  }
  
  processPage(targetPage);
  
  js.sleep(100);
}

function processPage(pageName) {
  //logSpiderMessage("Processing page "+pageName);
  
	for(var i=0;i<processors.length;i++) {
      try{
          processors[i].processPage(pageName);
      } catch(e) {
        logSpiderMessage("Error in processor "+i+" :"+e);
      }
	}
  
  //logSpiderMessage("Processed "+pageName);
}

function processFile(pageName,fileName) {
  //logSpiderMessage("Processing file "+pageName+"/"+fileName);
  
	for(var i=0;i<processors.length;i++) {
      try{
          processors[i].processFile(pageName,fileName);
      } catch(e) {
        logSpiderMessage("Error in processor "+i+" :"+e);
      }
	}
  
  //logSpiderMessage("Processed "+pageName+"/"+fileName);
}


if(processors.length===0) {
  logSpiderMessage("Error: No processors defined in config");
} else {
  logSpiderMessage("Crawling from "+config.startPage);
	crawl(config.startPage);
}

logSpiderMessage("Completed /OpenForum/Spider/spider.sjs");
