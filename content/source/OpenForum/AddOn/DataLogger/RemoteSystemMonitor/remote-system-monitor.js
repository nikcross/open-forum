/*
* Author: 
*/
var RemoteSystemMonitor = function() {

  var self = this;
  self.nodes = [];
  self.updateTime = "";

  var updateNodes = function() {
    self.updateTime = toDateTime( new Date().getTime() );
    JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getNodesList").onSuccess(setNodes).go();
  };
  
  var updateAll = function() {
    updateNodes();
  };

  var setNodes = function(response) {
    self.nodes = response.nodes;

    for(var i=0;i<self.nodes.length;i++) {
      var node = self.nodes[i];

      node.memory_free=0;
      node.disk_total=0;
      node.memory_free=0;
      node.memory_total=0;
      node.memory_total=0;
      node.memory_total=0;
      node.system_time=0;
      node.system_time_ts=0;
      node.system_startTime=0;
      node.processor_load=0;
      node.ipAddress=0;
      node.externalIpAdderess=0;

      JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getNodeInformation","node="+node.name).onSuccess(

        function (node) { 
          return function(response) {
            setNode(node,response);
          };
        }(node)

      ).go();
    }
    
    setTimeout(updateAll,10000);
  };

  var setNode = function(node, response) {
    for(var i in response.node) {
      var item = response.node[i];

      if( item.value.indexOf(".ts")!=-1 ) continue;
      var key = item.key.substring( ("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+node.name+".").length );
      key = key.replace( /\./g , "_" );

      node[key] = item.value;
    }

    node.processor_load_VIEW = node.processor_load;
    if(node.processor_load>100) {
      node.processor_load_VIEW = 100;
    }

    if(node.memory_free!==0 && node.memory_total!==0) {
      node.memory_free_pc = Math.round((node.memory_free*100)/node.memory_total);
      if(node.memory_free_pc>100) {
        node.memory_free_pc = 100;
      }
      node.memory_free = toMB(node.memory_free);
      node.memory_total = toMB(node.memory_total);
    }
    if(node.disk_free!==0 && node.disk_total!==0) {
      node.disk_free_pc = Math.round((node.disk_free*100)/node.disk_total);
      if(node.disk_free_pc>100) {
        node.disk_free_pc = 100;
      }

      node.disk_free = toGB(node.disk_free);

      node.disk_total = toGB(node.disk_total);
    }
    if(node.system_startTime!==0 && node.system_time!==0) {
      node.system_startTime = toDateTime(node.system_startTime);
      node.system_time = toDateTime(node.system_time);
    }
    if(node.system_time_ts!==0) {
      node.system_time_ts = toDateTime(node.system_time_ts);
    }
  };

  var toGB = function(value) {
    value = parseInt(value,10);
    value = Math.round(value/100000000)/10 + " GB";
    return value;
  };

  var toMB = function(value) {
    value = parseInt(value,10);
    value = Math.round(value/100000)/10 + " MB";
    return value;
  };

  var toDateTime = function(value) {
    var date = new Date();
    date.setTime(value);
    var time = padDigit(date.getHours())+":"+padDigit(date.getMinutes())+":"+padDigit(date.getSeconds());
    return date.toDateString() + " " +time;
  };

  var padDigit = function(value) {
    if(value<10) return "0"+value;
    return value;
  };
  
   self.getNodeStats = function(nodeName) {
     for(var i in self.nodes) {
       var node = self.nodes[i];
       if(node.name == nodeName) {
         return node;
       }
     }
     return null;
   };
   
  self.init = function() {
    updateAll();
  };
};

RemoteSystemMonitor = new RemoteSystemMonitor();
