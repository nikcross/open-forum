/*
* Author: 
* Description: 
*/

var addon = "/OpenForum/AddOn/PaperScape";
var deviceType = "Logger";
var deviceId = "&deviceId;";

external.getURLAsString("http://open-forum.onestonesoup.org/OpenForum/AddOn/Update?action=getUpdate&pageName="+addon);

  var ts = new Date().getTime();
  var data = "response:installed_"+addon;
  external.getURLAsString("http://open-forum.onestonesoup.org/OpenForum/AddOn/DataLogger?action=logData"+
                          "&serviceId=systemMonitor"+
                          "&deviceId="+deviceId+
                          "&deviceType="+deviceType+
                          "&record=false"+
                          "&time="+ts+
                          "&data="+data);
