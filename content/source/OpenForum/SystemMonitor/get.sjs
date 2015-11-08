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
} else if(action==="getState") {
  
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
    		systemTime: ""+systemMonitor.getTime(),
    		startTime: ""+systemMonitor.getStartTime()
           };
  
} else if(action==="getSystem") {
  
  var wlanIpAddress = "?";
  var wlanMACAddress= "?";
  try{
  	wlanIpAddress = "" + systemMonitor.getIpAddress("wlan0");
    wlanMACAddess = "" + systemMonitor.getMACAddress("wlan0");
  } catch(e) {};
  
  var ethIpAddress = "?";
  var ethMACAddress= "?";
  try{
  	ethIpAddress = "" + systemMonitor.getIpAddress("eth0");
    ethMACAddess = "" + systemMonitor.getMACAddress("eth0");
  } catch(e) {};
  
  result = {
    version: ""+openForum.getVersion(),
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
