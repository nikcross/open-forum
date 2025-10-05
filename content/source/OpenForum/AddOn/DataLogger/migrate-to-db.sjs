/*
* Author: 
* Description: 
*/

//https://open-forum.onestonesoup.org/OpenForum/AddOn/DataLogger?action=getData&serviceId=energyMonitor&deviceId=halcyon-server&key=using&startTime=1520188793168&endTime=1530188893168
//
var dataLogger = js.getObject("/OpenForum/AddOn/DataLogger","DataLogger.sjs");
var dbDataLogger = js.getObject("/OpenForum/AddOn/DataLogger","DBDataLogger.sjs");

var serviceId = "energyMonitor";
var deviceType = "pi energy logger";
var deviceId = "1bfc-energy-monitor";
var key = "generating";
var startTime=1400188793168;
var endTime = new Date().getTime();
var startDate = new Date();
startDate.setTime(startTime);
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);
var nextDate = new Date();
nextDate.setTime(startDate.getTime());
var nextTime = nextDate.getTime();
 var count = 0;

while(startTime<endTime) {
  startDate.setTime(nextTime);
  nextDate.setDate( nextDate.getDate()+1 );
  
  startTime = startDate.getTime();
  nextTime = nextDate.getTime();
  
  var rows = dataLogger.getData( serviceId,deviceId,key,startTime,nextTime );

  println("Migrating "+rows.length+" rows for "+startDate + " to " + nextDate);

  for(var r=0;r < rows.length;r++) {
    var data = key + ":" + rows[r].value; 
    try{
      dbDataLogger.logData(data,serviceId,deviceId,deviceType,rows[r].ts,true);
      count ++;
    } catch(e) {
      println( "ROW: (" + rows[r].value + ") TS: "+rows[r].ts+" Date:" + new Date(rows[r].ts) );
      println(e);
    }
  }
}

println("Migration finished. Rows:"+count);

