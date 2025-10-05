/*
* Author: 
*/

var nodes = [];
var updateTime = "";

OpenForum.init = function() {
  setTimeout(updateAll,10000);
  updateAll();
};

function updateAll() {
  updateNodes();

  setTimeout(updateAll,10000);
}

function updateNodes() {
  updateTime = toDateTime( new Date().getTime() );
  JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getNodesList").onSuccess(setNodes).go();
}

function setNodes(response) {
  nodes = response.nodes;

  for(var i=0;i<nodes.length;i++) {
    var node = nodes[i];

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
}

function setNode(node, response) {
  for(var i in response.node) {
    var item = response.node[i];

    if( item.value.indexOf(".ts")!=-1 ) continue;
    var key = item.key.substring( ("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+node.name+".").length );
    key = key.replace( /\./g , "_" );

    node[key] = item.value;
  }
  
    if(node.memory_free!==0 && node.memory_total!==0) {
      node.memory_free_pc = Math.round((node.memory_free*100)/node.memory_total);
      node.memory_free = toMB(node.memory_free);
      node.memory_total = toMB(node.memory_total);
    }
    if(node.disk_free!==0 && node.disk_total!==0) {
      node.disk_free_pc = Math.round((node.disk_free*100)/node.disk_total);
      
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
}


function toGB(value) {
  value = parseInt(value,10);
  value = Math.round(value/100000000)/10 + " GB";
  return value;
}

function toMB(value) {
  value = parseInt(value,10);
  value = Math.round(value/100000)/10 + " MB";
  return value;
}

function toDateTime(value) {
  var date = new Date();
  date.setTime(value);
  var time = padDigit(date.getHours())+":"+padDigit(date.getMinutes())+":"+padDigit(date.getSeconds());
  return date.toDateString() + " " +time;
}

function padDigit(value) {
  if(value<10) return "0"+value;
  return value;
}