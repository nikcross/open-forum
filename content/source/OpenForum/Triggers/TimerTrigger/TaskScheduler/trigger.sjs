/*
* Author: 
* Description: 
*/

try{
  function run(task) {
    if(task.enabled!==true) return;
    
    try{
      if(task.debug) log.debug("Running script "+task.scriptFile+" on page "+task.pageName);
      var script = "(function(debug) {"+file.getAttachment(task.pageName,task.scriptFile)+"})(task.debug);";
      var result = eval( script );
      if(result) {
        if(task.debug) log.debug("Completed script "+task.scriptFile+" on page "+task.pageName+" with result "+result);
      }
      task.lastRun = new Date().toString();
    } catch(e) {
      if(task.debug) log.debug("Failed to run "+task.scriptFile+" on page "+task.pageName+" Error:"+e);
    }
  }

  var schedule = file.getAttachment("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json");
  schedule = JSON.parse(schedule);

  for(var i=0;i<schedule.length;i++) {
    var task = schedule[i];

    if(task.scheduledTime==="Every ten seconds") {
      run(task);
    }
    else if(trigger.isMinutePeriod() && task.scheduledTime==="Every minute") {
      run(task);
    }
    else if( trigger.isTenMinutePeriod() && task.scheduledTime==="Every ten minutes" ) {
      run(task);
    }
    else if(trigger.isHourPeriod() && task.scheduledTime==="Every hour") {
      run(task);
    }
  }
  
  //file.saveAttachmentNoBackup("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule,null,4));

} catch(e) {
  log.error("Error in /OpenForum/Triggers/TimerTrigger/TaskScheduler/trigger.sjs Error:"+e);
}