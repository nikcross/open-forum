var action = transaction.getParameter("action");
if( action===null ) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
action = ""+action;
result = {error: "action "+action+" not recognised"};
var systemMonitor = js.getApi("/OpenForum/SystemMonitor");

if(action==="getVersion") {
  result = { version: openForum.getVersion() };
} else if(action==="getServer") {
  var fileViews = ""+openForum.retrieveValue("openForum.fileViews.bucket");
  var pageViews = ""+openForum.retrieveValue("openForum.pageViews.bucket");
  
  result = {
    fileViews: fileViews,
    pageViews: pageViews
  };
  
} else if(action==="getState") {
  
  var stores = [];
  
  var resourceStoreStats = openForum.getResourceStoreStats();
  var storeList = resourceStoreStats.getChildren();
  for( var i=0 ; i<storeList.size(); i++) {
    var store = storeList.get(i);
    
    stores.push( {
      name: ""+store.getName(),
      totalSpace: ""+store.getChild("totalSpace").getValue(),
      freeSpace: ""+store.getChild("freeSpace").getValue(),
      cacheSize: ""+store.getChild("cacheSize").getValue(),
      cacheFileCount: ""+store.getChild("cacheFileCount").getValue()
    } );
    
  }
  
  var httpServerStats = openForum.getHttpServerStats();
  var httpServer = {};
  
  if(httpServerStats) {
    httpServer.activeThreadCount = "" +httpServerStats.getChild("activeThreadCount").getValue();
    httpServer.maxThreadCount = "" +httpServerStats.getChild("maxThreadCount").getValue();
    httpServer.completedTaskCount = "" +httpServerStats.getChild("completedTaskCount").getValue();
    httpServer.timeoutTaskCount = "" +httpServerStats.getChild("timeoutTaskCount").getValue();
    httpServer.overflowTaskCount = "" +httpServerStats.getChild("overflowTaskCount").getValue();
    httpServer.maxResponseTime = "" +httpServerStats.getChild("maxResponseTime").getValue();
    httpServer.isMonitoring = "" +httpServerStats.getChild("isMonitoring").getValue();
  }
  
  var httpsServerStats = openForum.getHttpsServerStats();
  var httpsServer = {};
  
  if( httpsServerStats.getChildren().size()==0 ) {
      httpsServer.activeThreadCount = "";
      httpsServer.maxThreadCount = "";
      httpsServer.completedTaskCount = "";
      httpsServer.timeoutTaskCount = "";
      httpsServer.overflowTaskCount = "";
      httpsServer.maxResponseTime = "";
      httpsServer.isMonitoring = "No Https Server Running";
  } else {
      httpsServer.activeThreadCount = "" +httpsServerStats.getChild("activeThreadCount").getValue();
      httpsServer.maxThreadCount = "" +httpsServerStats.getChild("maxThreadCount").getValue();
      httpsServer.completedTaskCount = "" +httpsServerStats.getChild("completedTaskCount").getValue();
      httpsServer.timeoutTaskCount = "" +httpsServerStats.getChild("timeoutTaskCount").getValue();
      httpsServer.overflowTaskCount = "" +httpsServerStats.getChild("overflowTaskCount").getValue();
      httpsServer.maxResponseTime = "" +httpsServerStats.getChild("maxResponseTime").getValue();
      httpsServer.isMonitoring = "" +httpsServerStats.getChild("isMonitoring").getValue();
  }
  
  result = { 
    memory: { 
      total: ""+systemMonitor.getMemory(),
      free: ""+(systemMonitor.getMemory()-systemMonitor.getMemoryUsed())
    } , 
    disk: {
      total: ""+systemMonitor.getDriveTotalSpace("/"),
      free: ""+systemMonitor.getDriveFreeSpace("/")
    } ,
    processor: {
      load: ""+systemMonitor.getProcessorLoad()
    },
    stores: stores,
    httpServer: httpServer,
    httpsServer: httpsServer,
    systemTime: ""+systemMonitor.getTime(),
    startTime: ""+systemMonitor.getStartTime()
  };

} else if(action==="getSystem") {

  var javaVersion = "" + java.lang.System.getProperty("java.version");
  
  var wlanIpAddress = "?";
  var wlanMACAddress= "?";
  try{
    wlanIpAddress = "" + systemMonitor.getIpAddress("wlan0");
    wlanMACAddress = "" + systemMonitor.getMACAddress("wlan0");
  } catch(e) {}

  var ethIpAddress = "?";
  var ethMACAddress= "?";
  try{
    ethIpAddress = "" + systemMonitor.getIpAddress("eth0");
    ethMACAddress = "" + systemMonitor.getMACAddress("eth0");
  } catch(e) {}

  result = {
    version: ""+openForum.getVersion(),
    javaVersion: ""+javaVersion,
    operatingSystem: {
      name: ""+systemMonitor.getOperatingSystem(),
      version: ""+systemMonitor.getOperatingSystemVersion()
    },
    network: {
      wifi: {
        adapter: "wlan0",
        ipAddress: wlanIpAddress,
        macAddress: wlanMACAddress
      },
      ethernet: {
        adapter: "eth0",
        ipAddress: ethIpAddress,
        macAddress: ethMACAddress
      }
    },
    processor: {
      name: ""+systemMonitor.getProcessor(),
      count: ""+systemMonitor.getProcessors()
    }
  };

}

result = JSON.stringify(result);
transaction.sendPage(result);
