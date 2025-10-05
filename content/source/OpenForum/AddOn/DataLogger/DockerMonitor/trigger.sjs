/*
* Author: 
* Description: 
*/
try{
  var DockerMonitor = js.getObject("/OpenForum/AddOn/DataLogger/DockerMonitor","DockerMonitor.sjs");
  DockerMonitor.monitorDocker();
} catch(e) {
  log.error(e + " in /OpenForum/AddOn/DataLogger/DockerMonitor trigger");
}