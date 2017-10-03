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

  Common = js.getObject("/OpenForum/Javascript","Common.sjs");
  Common.extendString(String);
  Common.extendDate(Date);

  var schedule;
  if(file.attachmentExists("/OpenForum/Triggers/TimerTrigger/TaskScheduler","updated-schedule.json")) {
    schedule = file.getAttachment("/OpenForum/Triggers/TimerTrigger/TaskScheduler","updated-schedule.json");
    file.deleteAttachmentNoBackup("/OpenForum/Triggers/TimerTrigger/TaskScheduler","updated-schedule.json");
  } else {
    schedule = file.getAttachment("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json");
  }
  schedule = JSON.parse(schedule);
  var now = new Date();
  
  function dateMatches(a,b) {
    if(a.getDate()===b.getDate() &&
       a.getMonth()===b.getMonth() && 
       a.getFullYear()===b.getFullYear()) {
      return true;
    } else {
      return false;
    }
  }

  function timeMatches(a,b) {
    if(a.getHours()===b.getHours() &&
       a.getMinutes()===b.getMinutes() ) {
      return true;
    } else {
      return false;
    }
  }

  for(var i=0;i<schedule.length;i++) {
    var task = schedule[i];

    if(task.scheduledTime==="Every ten seconds") {
      run(task);
    } else if(trigger.isMinutePeriod() && task.scheduledTime==="Every minute") {
      run(task);
    } else if( trigger.isTenMinutePeriod() && task.scheduledTime==="Every ten minutes" ) {
      run(task);
    } else if(trigger.isHourPeriod() && task.scheduledTime==="Every hour") {
      run(task);
    } else if(trigger.isHourPeriod() && task.scheduledTime==="Every month") {
      if(now.getDate()==1 && now.getHours()==8) {
        run(task);
      }
    } else if(trigger.isHourPeriod() && task.scheduledTime.startsWith("Every week")) {
      var day = 1;
      if(task.scheduledTime.toLowerCase().indexOf(" on ")!=-1) {
        var dayName = task.scheduledTime.toLowerCase().after(" on ");
        switch(dayName) {
          case "sunday":
            day = 0;
            break;
          case "monday":
            day = 1;
            break;
          case "tuesday":
            day = 2;
            break;
          case "wednesday":
            day = 3;
            break;
          case "thursday":
            day = 4;
            break;
          case "friday":
            day = 5;
            break;
          case "saturday":
            day = 6;
        }
      }
      if(now.getDay()==day && now.getHours()==8) {
        run(task);
      }
    } else if(trigger.isHourPeriod() && task.scheduledTime==="Every year") {
      if(now.getMonth()===0 && now.getDate()==1 && now.getHours()==8) {
        run(task);
      }
    } else if(trigger.isMinutePeriod() && task.scheduledTime.startsWith("Every day at ")) {
      var testDate = new Date().setHHMM(task.scheduledTime.toLowerCase().after(" at "));
      if( timeMatches(now,testDate) ) {
        run(task);
      }
    } else if(trigger.isMinutePeriod() && task.scheduledTime.startsWith("On ")) {
      var testDate;
      if(task.scheduledTime.indexOf(" at ")!=-1) {
        testDate = new Date().parseDDMMYYYY(task.scheduledTime.toLowerCase().between("on "," ")).setHHMM(task.scheduledTime.toLowerCase().after(" at "));
        if( dateMatches(now,testDate) && timeMatches(now,testDate) ) {
          run(task);
        }
      } else {
        testDate = new Date().parseDDMMYYYY(task.scheduledTime.toLowerCase().after("on ")).setHHMM("08:00");
        if( dateMatches(now,testDate) && timeMatches(now,testDate) ) {
          run(task);
        }
      }
    } else if(trigger.isMinutePeriod() && task.scheduledTime.startsWith("script:")) {
      var script = JSON.parse( task.scheduledTime.after("script:") );
      if( eval(""+file.getAttachment(script.pageName,script.fileName))===true ) {
        run(task);
      }
    }
  }
      
  file.saveAttachmentNoBackup("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule,null,4));

} catch(e) {
  log.error("Error in /OpenForum/Triggers/TimerTrigger/TaskScheduler/trigger.sjs Error:"+e);
}
