var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");

try {
  var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/systemMonitor.*.externalIpAddress");
  nodes = [];
  for(var i in keys) {
    var key = ""+keys[i];
    var node = openForum.retrieveObject(key);
    var name = key.substring("/OpenForum/AddOn/DataLogger/Data/systemMonitor.".length,key.indexOf(".externalIpAddress"));

    var node = { name: name };
    var keys = openForum.findStoreKeys("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+node.name+".*");
    for(var i in keys) {
      var key = ""+keys[i];
      var value = ""+openForum.retrieveObject(key);

      if( value.indexOf(".ts")!=-1 ) continue;
      var key = key.substring( ("/OpenForum/AddOn/DataLogger/Data/systemMonitor."+node.name+".").length );
      key = key.replace( /\./g , "_" );
      node[key] = value;
    }    

    nodes.push();
  }

  for(var n in nodes) {
    var node = nodes[n];

    var disk_free_pc = Math.round((node.disk_free*100)/node.disk_total);
    var memory_free_pc = 100;
    if(node.memory_free!==0 && node.memory_total!==0) {
      memory_free_pc = Math.round((node.memory_free*100)/node.memory_total);
    }
    var processor_free_pc = 100-node.processor_load;

    if(disk_free_pc<10) {
      Alert.triggerAlert("Disk space low on " + node.name,node.name+" running low on disk space. " + disk_free_pc + "% left. "+node.disk_free+" of "+node.disk_total);
    }
    if(memory_free_pc<10) {
      Alert.triggerAlert("Memory low on " + node.name,node.name+" running low on memory. " + memory_free_pc + "% left. "+node.memory_free+" of "+node.memory_total);
    }
    if(processor_free_pc<0) {
      Alert.triggerAlert("Processor overloaded on " + node.name,node.name+". Running at " + node.processor_load + "%");
    }
  }


} catch(e) {
  Alert.triggerAlert("Error in Remote System Monitor","Error:"+e);
}