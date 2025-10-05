/*
* Author: 
* Description: 
*/
var DockerMonitor = function() {
  var self = this;

  var convertValue = function(v) {
    try{
    return eval(v
                .replace("kB","/1000")
                .replace("MiB","").replace("MB","")
                .replace("GiB","*1000").replace("GB","*1000")
                .replace("B","/1000000")
               );
    } catch(e) {
      return 0;
    }
  };

  var alertLevels = {
    memPC: 90,
    cpuPC: 110
  };

  self.version = "0.0.1 Dizzle Day Release";
  
  self.monitorDocker = function() {
    var stats = self.getDockerStats();

    for( var s in stats ) {
      var entry = stats[s];

      var blockIOTS = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO.ts");
      var blockIOTSLast = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO.lastts");
      
      if( blockIOTSLast == "null" ) {

        var blockIO = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO");

        blockIO = blockIO.split("/");

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO.lastts",blockIOTS);
        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIOLast",blockIO[0] + "/" + blockIO[1]);

        var read = convertValue(blockIO[0]);
        var write = convertValue(blockIO[1]);

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".dBlockIO",read + "/" + write);

        
      } else if(blockIOTS!=blockIOTSLast) {
        
        var blockIO = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO");
        var blockIOLast = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIOLast");
        blockIO = blockIO.split("/");
        blockIOLast = blockIOLast.split("/");

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIO.lastts",blockIOTS);
        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".blockIOLast",blockIO[0] + "/" + blockIO[1]);

        var read = convertValue(blockIO[0]) - convertValue(blockIOLast[0]);
        var write = convertValue(blockIO[1]) - convertValue(blockIOLast[1]);

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".dBlockIO",read + "/" + write);
        
        
      }

      var netIOTS = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO.ts");
      var netIOTSLast = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO.lastts");
      
      if( netIOTSLast == "null" ) {

        var netIO = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO");

        netIO = netIO.split("/");

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO.lastts",netIOTS);
        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIOLast",netIO[0] + "/" + netIO[1]);

        var sent = convertValue(netIO[0]);
        var recieved = convertValue(netIO[1]);

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".dNetIO",sent + "/" + recieved);

      } else if(netIOTS!=netIOTSLast) {
        
        var netIO = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO");
        var netIOLast = "" + openForum.retrieveObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIOLast");
        netIO = netIO.split("/");
        netIOLast = netIOLast.split("/");

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIO.lastts",netIOTS);
        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".netIOLast",netIO[0] + "/" + netIO[1]);

        var sent = convertValue(netIO[0]) - convertValue(netIOLast[0]);
        var recieved = convertValue(netIO[1]) - convertValue(netIOLast[1]);

        openForum.storeObject("/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+entry.service+".dNetIO",sent + "/" + recieved);
      }

      var memPC = (entry.memory/entry.totalMemory)*100;

      if(memPC > alertLevels.memPC) {
        var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
        Alert.triggerAlert("Docker memory use high","Docker service " + entry.service + " is using " + Math.round( memPC ) + " percent of available memory" );
      }

      var cpuPC = parseFloat( entry.cpu.replace("%","") );
      if(cpuPC > alertLevels.cpuPC) {
        var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
        Alert.triggerAlert("Docker cpu use high","Docker service " + entry.service + " is using " + Math.round( cpuPC ) + " percent of available cpu" );
      }
    }

  };

  self.getDockerStats = function() {

    var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/dockerMonitor.*containerId");
    var stats = [];

    for(var k in keys) {
      try{
        var service = (""+keys[k]).split(".")[1];

        stat = self.getDockerServiceStats(service);

        stats.push(stat);
      } catch( e ) {
      }
    }
    return stats;
  };

  self.getDockerServiceStats = function(service) {

    var cpu = ""+openForum.retrieveObject( "/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+service+".cpu" );
    var memory = ""+openForum.retrieveObject( "/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+service+".memUsage" );
    memory = memory.split("/");
    totalMemory = convertValue(memory[1]);
    memory = convertValue(memory[0]);

    var netIO = ""+openForum.retrieveObject( "/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+service+".dNetIO" );
    if(netIO == "null") netIO = "0 / 0";
    netIO = netIO.split("/");
    netIO = {sent: convertValue(netIO[0]), received: convertValue(netIO[1])};

    var blockIO = ""+openForum.retrieveObject( "/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+service+".dBlockIO" );
    if(blockIO == "null") blockIO = "0 / 0";
    blockIO = blockIO.split("/");
    blockIO = {read: convertValue(blockIO[0]), write: convertValue(blockIO[1])};     

    var pids = parseInt(""+openForum.retrieveObject( "/OpenForum/AddOn/DataLogger/Data/dockerMonitor."+service+".pids" ));

    return  {service: service, cpu: cpu, memory: memory, totalMemory: totalMemory, netIO: netIO, blockIO: blockIO, pids: pids};
  };
};
