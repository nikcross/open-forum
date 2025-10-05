
//Refresh Plugins (should not be required but seems to be a problem with DB)
//TODO Fix this
js.refreshPluginManager();

function publishService(pageName,objectName) {
  try{
    var pagePrefix = "Development/";
      
    if(!objectName || objectName=="") objectName = pageName;
    
    if(pageName.charAt(0)!="/") {
      pageName = "/" + pagePrefix + "ServiceLayer/" +pageName+ "/private";
    }
      
    var obj = js.getObject( pageName, objectName + ".sjs");
    openForum.storeObject( pagePrefix + objectName, obj );
    return "Published " + pagePrefix + objectName + "\n";
  } catch(e) {
    return "FAILED to publish " + pagePrefix + objectName + " from " + pageName + "/" + objectName + ".sjs \nError:"+e+"\n";
  }
}

var result = "";
//System Service Definitions

var services = JSON.parse( "" + file.getAttachment("/Development/ServiceLayer","services-list.json") );

for(var i in services) {
  var service = services[i];
  result += publishService(service.pageName,service.objectName);
}
