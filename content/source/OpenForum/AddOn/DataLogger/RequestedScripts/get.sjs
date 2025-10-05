var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action==="getScriptsList") {
    var pageName = "/OpenForum/AddOn/DataLogger/RequestedScripts";

    var attachments=[];
    var matching = ".*request-script.sjs"; //Regex include all

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!=='/')
    {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      if(key.charAt(0)==='+') { // ignore sub pages
        continue;
      } else if(matching!==null && key.search( ""+matching )==-1 ) {
        continue;
      }

      attachments.push( {pageName: pageName, fileName: key} );

    }

    result = {result: "ok", message: "Performed action "+action, attachments: attachments};
  }  if(action==="getRequestedScriptsList") {
    var pageName = "/OpenForum/AddOn/DataLogger/RequestedScripts";

    var attachments=[];
    var matching = ".*requested-script.sjs"; //Regex include all

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!=='/')
    {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      if(key.charAt(0)==='+') { // ignore sub pages
        continue;
      } else if(matching!==null && key.search( ""+matching )==-1 ) {
        continue;
      }

      attachments.push( {pageName: pageName, fileName: key} );

    }

    result = {result: "ok", message: "Performed action "+action, attachments: attachments};
  } else if(action==="getNodesList") {
    var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/systemMonitor.*.network.ipAddress");
    nodes = [];
    for(var i in keys) {
      var key = ""+keys[i];
      var node = openForum.retrieveObject(key);
      var name = key.substring("/OpenForum/AddOn/DataLogger/Data/systemMonitor.".length,key.indexOf(".network.ipAddress"));
      
      nodes.push({ name: name });
    }
    result = {result: "ok", message: "Performed action "+action, attachments: attachments, nodes: nodes};
  } else if(action==="getNodeInformation") {
    var nodeName = ""+transaction.getParameter("node");
    nodeName = nodeName.replace("(","\\(").replace(")","\\)");
    
    var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+nodeName+".*");
    var node = [];
    for(var i in keys) {
      var key = ""+keys[i];
      var value = ""+openForum.retrieveObject(key);
      
      node.push({ key: key, value:value });
    }
    result = {result: "ok", message: "Performed action "+action, attachments: attachments, node: node, nodeName: nodeName};
  } else if(action==="clearNodeInformation") {
    
    var nodeName = ""+transaction.getParameter("node");
    
    var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+nodeName+".*");
    var node = [];
    for(var i in keys) {
      var key = ""+keys[i];
       openForum.removeObject(key);
      var value = ""+openForum.retrieveObject(key);
      
      node.push({ key: key, value:value });
    }
    result = {result: "ok", message: "Performed action "+action, attachments: attachments, node: node, nodeName: nodeName}; 
    
  } else if(action==="sendScript") {
    var script = ""+transaction.getParameter("script");
    var node = ""+transaction.getParameter("node");
    
    var code = ""+file.getAttachment("/OpenForum/AddOn/DataLogger/RequestedScripts",script);
    code = code.replace( new RegExp("&deviceId;","g") ,node);
    file.saveAttachment("/OpenForum/AddOn/DataLogger/RequestedScripts",node+"-requested-script.sjs",code);
    
    
    result = {result: "ok", message: "Performed action "+action, node: node, script: script}; 
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
