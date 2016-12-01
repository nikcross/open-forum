/*
* Author: 
* Description: 
*/
try{

  //log.debug("Running at "+new Date());

  var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
  DB.setAlias("open-forum");

  Common = js.getObject("/OpenForum/Javascript","Common.sjs");
  Common.extendString(String);
  Common.extendDate(Date);

  function run(task) {
    if(task.enabled!==true) {
      log.debug("DISABLED: Not Running script "+task.scriptFile+" on page "+task.pageName);
      return;
    }

    try{
      if(task.debug) log.debug("Running script "+task.scriptFile+" on page "+task.pageName);
      var script = "(function(debug) {"+file.getAttachment(task.pageName,task.scriptFile)+"})(task.debug);";
      var result = js.startJavascript(task.pageName+"/"+task.fileName,script); //eval( script );
      if(result) {
        if(task.debug) log.debug("Completed script "+task.scriptFile+" on page "+task.pageName+" with result "+result);
      }
      task.lastRun = new Date().toString();
      var sql = "update triggerSchedule set lastRun='"+task.lastRun+"' where name='"+task.name+"'";
      DB.execute(sql);
    } catch(e) {
      log.error("Failed to run "+task.scriptFile+" on page "+task.pageName+" Error:"+e);
      var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
      Alert.triggerAlert("Scheduled Task Error "+task.pageName+"/"+task.scriptFile,"Failed to run "+task.scriptFile+" on page "+task.pageName+" Error:"+e);
    }
  }

  var result = DB.query("select * from triggerSchedule");
  var schedule = [];

  for(var i in result.table.rows) {
    var row = result.table.rows[i];
    var entry = {
      name: row.cell0,
      pageName: row.cell1,
      scriptFile: row.cell2,
      lastRun: row.cell3,
      scheduledTime: row.cell4,
      enabled: (row.cell5=="t"),
      debug: (row.cell6=="t")
    };
    schedule.push(entry);
  }
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

var isMinutePeriod = trigger.isMinutePeriod();
var isTenMinutePeriod = trigger.isTenMinutePeriod();
var isHourPeriod = trigger.isHourPeriod();


for(var i=0;i<schedule.length;i++) {
  var task = schedule[i];
  
  if(task.scheduledTime==="Every ten seconds") {
    run(task);
  } else if(isMinutePeriod && task.scheduledTime==="Every minute") {
    run(task);
  } else if( isTenMinutePeriod && task.scheduledTime==="Every ten minutes" ) {
    log.debug("Running script "+task.scriptFile+" on page "+task.pageName);
    run(task);
  } else if(isHourPeriod && task.scheduledTime==="Every hour") {
    run(task);
  } else if(isHourPeriod && task.scheduledTime==="Every month") {
    if(now.getDate()==1 && now.getHours()==8) {
      run(task);
    }
  } else if(isHourPeriod && task.scheduledTime.startsWith("Every week")) {
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
  } else if(isHourPeriod && task.scheduledTime==="Every year") {
    if(now.getMonth()===0 && now.getDate()==1 && now.getHours()==8) {
      run(task);
    }
  } else if(isMinutePeriod && task.scheduledTime.startsWith("Every day at ")) {
    var testDate = new Date().setHHMM(task.scheduledTime.toLowerCase().after(" at "));
    if( timeMatches(now,testDate) ) {
      run(task);
    }
  } else if(isMinutePeriod && task.scheduledTime.startsWith("On ")) {
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
  } else if(isMinutePeriod && task.scheduledTime.startsWith("script:")) {
    var script = JSON.parse( task.scheduledTime.after("script:") );
    if( eval(""+file.getAttachment(script.pageName,script.fileName))===true ) {
      run(task);
    }
  }
}

} catch(e) {
  log.error("Error in /OpenForum/Triggers/TimerTrigger/TaskScheduler/trigger.sjs Error:"+e);
  var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
  Alert.triggerAlert("Task Scheduler Error");
}
