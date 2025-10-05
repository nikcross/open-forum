/*
* Author: 
* Description: 
*/

var newScript = ""+external.getURLAsString("http://open-forum.onestonesoup.org/OpenForum/AddOn/RemoteLogger/LogSystemStatus/trigger.sjs");
newScript = newScript.replace(/one-stone-soup-server/g,"&deviceId;");

file.saveAttachment("/OpenForum/AddOn/RemoteLogger/LogSystemStatus","trigger.sjs",newScript);

  var ts = new Date().getTime();
  var data = "response:loaded-script";
  external.getURLAsString("http://open-forum.onestonesoup.org/OpenForum/AddOn/DataLogger?action=logData"+
                          "&serviceId=systemMonitor"+
                          "&deviceId=nik-laptop"+
                          "&deviceType=laptop"+
                          "&record=false"+
                          "&time="+ts+
                          "&data="+data);
