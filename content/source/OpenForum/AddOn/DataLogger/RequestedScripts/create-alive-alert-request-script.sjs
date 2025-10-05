/*
* Author: 
* Description: 
*/
var TaskScheduler = null;

try{
  TaskScheduler = js.getObject("/OpenForum/Triggers/TimerTrigger/TaskScheduler","TaskScheduler.sjs");
} catch(e) {
  TaskScheduler = new function() {
    var self = this;

    self.addTask = function(name,pageName,script,time,scheduledTime,debug,enabled) {
      
      var task = {
        "id": "--",
        "name": name,
        "pageName": pageName,
        "scriptFile": script,
        "lastRun": time,
        "scheduledTime": scheduledTime,
        "enabled": enabled,
        "debug": debug
    	};
      
      var schedule = JSON.parse(""+file.getAttachment("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json"));
      schedule.push(task);
      file.saveAttachmentNoBackup("/OpenForum/Triggers/TimerTrigger/TaskScheduler","updated-schedule.json",JSON.stringify(schedule,null,4));
      file.saveAttachmentNoBackup("/OpenForum/Triggers/TimerTrigger/TaskScheduler","updated-schedule.json.check",JSON.stringify(schedule,null,4));
      
    };
  };
}

var deviceType = "Logger";
var deviceId = "&deviceId;";

//Create heartbeat alert
var url = "https://open-forum.onestonesoup.org/OpenForum/AddOn/Alert?action=saveAlert&name=Heart Beat for "+deviceId+"&type=heartMonitor&alertTime=120000&escalateTime=1200000";
url = url.replace(/ /g,"+");
external.getURLAsString(url);

url = "https://open-forum.onestonesoup.org/OpenForum/AddOn/Alert?action=beatAlert&name=Heart Beat for "+deviceId;
url = url.replace(/ /g,"+");
external.getURLAsString(url);

beatScript = '//Heart Beat Version 0.0.2 \n'+
'var url="https://open-forum.onestonesoup.org/OpenForum/AddOn/Alert?action=beatAlert&name=Heart Beat for '+deviceId+'";\n'+
'url = url.replace(/ /g,"+");\n'+
'external.getURLAsString(url);\n';

//Save heartbeat alert script
file.saveAttachmentNoBackup( "/OpenForum/AddOn/RemoteLogger/LogSystemStatus" , "heart-beat.sjs" , beatScript );

//Create scheduled trigger for script
TaskScheduler.addTask("Log System Heart Beat","/OpenForum/AddOn/RemoteLogger/LogSystemStatus","heart-beat.sjs",0,"Every minute",true,true);


  