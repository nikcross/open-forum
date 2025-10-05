/*
* Author: 
*/
OpenForum.includeScript("/Development/ServiceLayer/ServiceLayerClient.js");

var serviceObjects=[];
var rowTemplate = {"pageName":"","objectName":"","status":"Not Registered"};
var messages = "";

OpenForum.init = function() {
  OpenForum.loadJSON('/Development/ServiceLayer/services-list.json', function(data){ 
    serviceObjects=data;
    for(var i in serviceObjects) {
      if(typeof serviceObjects[i].objectName=="undefined") {
        serviceObjects[i].objectName = "";
      }
      serviceObjects[i].status = "Not Registered";
    }
    OpenForum.scan();
    OpenForum.Table.closeTable(serviceObjects);
    
    messages = "Loading states<br/>";
    
    JSON.get("/OpenForum/SystemMonitor/SystemStoreMonitor","getData").onSuccess(function(response) {
      for(var i in response.data) {
        for(var j in serviceObjects) {
          if(response.data[i].key==serviceObjects[j].objectName && serviceObjects[j].objectName!="") {
            serviceObjects[j].status = "Registered";
            break;
          }
        }
      }
      messages = "Ready<br/>";
    }).go();
  });
};

function refresh( where ) {
  if( where == "ALL" ) {
    ServiceLayerClient.refresh( processResponse );
  } else if( where == "DEV" ) {
    ServiceLayerClient.refreshDevelopment( processResponse );
  } else if( where == "PROD" ) {
    ServiceLayerClient.refreshLive( processResponse );
  }
}

function processResponse( response ) {
  if(response.result=="error") {
    messages = response.message.replaceAll("\n","<br/>");
    return;
  }
  messages = response.data.replaceAll("\n","<br/>");
}


