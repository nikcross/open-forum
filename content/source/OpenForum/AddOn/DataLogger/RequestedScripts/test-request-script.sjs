/*
* Author: 
* Description: 
*/

  var ts = new Date().getTime();
  var data = "response:ok";
  external.getURLAsString("http://open-forum.onestonesoup.org/OpenForum/AddOn/DataLogger?action=logData"+
                          "&serviceId=systemMonitor"+
                          "&deviceId=nik-laptop"+
                          "&deviceType=laptop"+
                          "&record=false"+
                          "&time="+ts+
                          "&data="+data);
