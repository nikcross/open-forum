/*
* Author: 
* Description: 
*/
//var task;

result = "Task Scheduler needs DB set up. " + new Date();

/*

var now = new Date();
var debug = true;
var MAX_TIME = 9500;
var queueName = "/OpenForum/Triggers/TimerTrigger/TaskScheduler";

if( typeof(trigger)==="undefined" ) {
  //Debug Mode
  debug = true;
  now = new Date( "2023/11/06 20:10:00" );
  trigger = {
    isMinutePeriod: function(){ return now.getSeconds()==0; },
    isTenMinutePeriod: function(){ return (now.getMinutes() % 10 == 0); },
    isHourPeriod: function(){ return (now.getMinutes()==0 && now.getSeconds()==0); }
  };

  log = {
    debug: function(message) {
      println("LOG DEBUG: "+message);
    },
    info: function(message) {
      println("LOG INFO: "+message);
    },
    error: function(message) {
      println("LOG ERROR: "+message);
    }
  };
  
  println("Running in debug mode at " + now);
} else if( typeof trigger.isMock != "undefined" ) { // Keep the mock version for tests
  
  now = new Date();
  //Replace trigger experiment
  trigger = {
    isMinutePeriod: function(){ return now.getSeconds()<10; },
    isTenMinutePeriod: function(){ return (now.getMinutes() % 10 == 0  && now.getSeconds()<10); },
    isHourPeriod: function(){ return (now.getMinutes()==0 && now.getSeconds()<10); }
  };
  
  openForum.postMessageToQueue( queueName,"Running in mock trigger mode at " + now );
}

  
function logToSchedulerQueue(message) {
  openForum.postMessageToQueue( queueName,message );
}

function getLogFileDate(date) {
  var logFileDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
  return logFileDate;
}

function logTaskMessage(taskMessage) {

  var fileName = getLogFileDate(now) + "-task-log.txt";
  if(file.attachmentExists(LOG_PAGE,fileName)==false) {

    //Delete seven day old log
    //Keep seven days
    var oldestDate = new Date( now.getTime() );
    oldestDate.setDate( oldestDate.getDate()-8 );
    var oldFile = getLogFileDate(oldestDate) + "-task-log.txt";
    if(file.attachmentExists(LOG_PAGE,oldFile)==true) {
      file.deleteAttachmentNoBackup(LOG_PAGE, oldFile);
    }

    file.appendStringToFileNoBackup( LOG_PAGE , fileName , "Task Log File For " + now + "\n\n" );
  }

  file.appendStringToFileNoBackup( LOG_PAGE , fileName , now + " : " + taskMessage + "\n" );

  if( file.getAttachmentSize(  LOG_PAGE , fileName ) > MAX_LOG_FILE_SIZE ) {
    var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
    Alert.triggerAlert("Task Log Too Big","Task log " + LOG_PAGE + fileName + " is " + Math.round( file.getAttachmentSize(  LOG_PAGE , fileName )/1000 ) + "kB" );
  }
}

function logTask(task,index) {
  if(task.enabled!==true) {
    logTaskMessage("DISABLED: Not Running script ("+task.name+": "+i+") "+task.scriptFile+" on page "+task.pageName);
    return;
  } else {
    logTaskMessage("Running script ("+task.name+": "+i+") "+task.scriptFile+" on page "+task.pageName);
  }
}

function run(task,index) {
  if(task.enabled!==true && (task.debug || debug)) {
    logToSchedulerQueue("DISABLED: Not Running script ("+index+") "+task.scriptFile+" on page "+task.pageName);
    return;
  }

  try{
    if(task.debug || debug) logToSchedulerQueue("Running script ("+task.name+": "+index+") "+task.scriptFile+" on page "+task.pageName);
    var script = "(function(debug) {\n"+file.getAttachment(task.pageName,task.scriptFile)+"\n})(task.debug);";
    //var result = js.startJavascript(task.pageName+"/"+task.fileName,script); 
    var result = eval( script );
    if(result) {
      if(task.debug) logToSchedulerQueue("Completed script ("+index+") "+task.scriptFile+" on page "+task.pageName+" with result "+result);
    }
    task.lastRun = now.toString();
    var sql = "update triggerSchedule set lastRun='"+task.lastRun+"' where name='"+task.name+"'";
    DB.execute(sql);
  } catch(e) {
    var message = "{ exception: '"+e+"' ";
    if(typeof e == "object") {
      for(var i in e) {
        message += "," + i + ": '" + e[i]+"'";
      }
    }
    message+= "}";

    log.error("Failed to run script ("+index+") "+task.scriptFile+" on page "+task.pageName+" Error:"+message);
    logTaskMessage("Failed to run script ("+index+") "+task.scriptFile+" on page "+task.pageName+" Error:"+message);
    var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
    Alert.triggerAlert("Scheduled Task Error "+task.pageName+"/"+task.scriptFile,"Failed to run "+task.scriptFile+" on page "+task.pageName+" Error:"+message);
  }
}

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

var resultMessage = "Start " + now + " ";

var schedule = [];

try{

  var LOG_PAGE = "/OpenForum/Triggers/TimerTrigger/TaskScheduler/Logs";
  var MAX_LOG_FILE_SIZE = 250000; //250kB

  var config = openForum.retrieveObject("config");
  var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
  DB.setAlias( config.getValue("database") );
  
  Common = js.getObject("/OpenForum/Javascript","Common.sjs");
  Common.extendString(String);
  Common.extendDate(Date);

  var result = DB.query("select * from triggerSchedule");

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
  
  var isMinutePeriod = trigger.isMinutePeriod();
  var isTenMinutePeriod = trigger.isTenMinutePeriod();
  var isHourPeriod = trigger.isHourPeriod();
  var tooLong = false;
  var lastTime = new Date().getTime();
  
  if(isHourPeriod) {
    logTaskMessage("\nPROCESSING HOUR " + now.getHours() + "\n");
  }
  
  var periods = "10s ";
  if(isMinutePeriod) periods += "1m ";
  if(isTenMinutePeriod) periods += "10m ";
  if(isHourPeriod) periods += "1hr ";
  
  logToSchedulerQueue( "Processing " + schedule.length + " tasks at " + now + ". Periods:  "+ periods  );
  
  for(var i=0;i<schedule.length;i++) {
    var task = schedule[i];

    if(task.scheduledTime==="Every ten seconds") {
      run(task,i);
    } else if(isMinutePeriod && task.scheduledTime==="Every minute") {
      run(task,i);
    } else if( isTenMinutePeriod && task.scheduledTime==="Every ten minutes" ) {
      logTask(task,i);
      run(task,i);
    } else if(isHourPeriod && task.scheduledTime==="Every hour") {
      logTask(task,i);
      run(task,i);
    } else if(trigger.isTenMinutePeriod() && task.scheduledTime==="Every half hour" && (now.getMinutes()===0 || now.getMinutes()===30)) {
      logTask(task,i);
      run(task,i);
    } else if(isHourPeriod && task.scheduledTime==="Every month") {
      if(now.getDate()==1 && now.getHours()==8) {
        logTask(task,i);
        run(task,i);
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
        logTask(task,i);
        run(task,i);
      }
    } else if(isHourPeriod && task.scheduledTime==="Every year") {
      if(now.getMonth()===0 && now.getDate()==1 && now.getHours()==8) {
        logTask(task,i);
        run(task,i);
      }
    } else if(isMinutePeriod && task.scheduledTime.startsWith("Every day at ")) {
      var testDate = new Date( now.getTime() ).setHHMM(task.scheduledTime.toLowerCase().after(" at "));

      if( timeMatches(now,testDate) ) {
        logTask(task,i);
        run(task,i);
      }
    } else if(isMinutePeriod && task.scheduledTime.startsWith("On ")) {
      var testDate;
      if(task.scheduledTime.indexOf(" at ")!=-1) {
        testDate = new Date().parseDDMMYYYY(task.scheduledTime.toLowerCase().between("on "," ")).setHHMM(task.scheduledTime.toLowerCase().after(" at "));
        if( dateMatches(now,testDate) && timeMatches(now,testDate) ) {
          logTask(task,i);
          run(task,i);
        }
      } else {
        testDate = new Date().parseDDMMYYYY(task.scheduledTime.toLowerCase().after("on ")).setHHMM("08:00");
        if( dateMatches(now,testDate) && timeMatches(now,testDate) ) {
          logTask(task,i);
          run(task,i);
        }
      }
    } else if(isMinutePeriod && task.scheduledTime.startsWith("js:")) {
      var script = JSON.parse( task.scheduledTime.after("js:") );
      if( eval(""+file.getAttachment(script.pageName,script.fileName))===true ) {
        logTask(task,i);
        run(task,i);
      }
    }

    var oldTime = lastTime;
    lastTime = new Date().getTime();
    task.timeTaken = lastTime-oldTime;
    
    if( ! tooLong ) {
      var timeTaken = lastTime - now.getTime();

      if(timeTaken > MAX_TIME) {
        logTaskMessage("Scheduled Tasks Taking Too Long: Over ran MAX_TIME running tasks. Last task "+task.scriptFile+" on page "+task.pageName+" Task "+i+" of "+schedule.length);
        var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
        Alert.triggerAlert("Scheduled Tasks Taking Too Long", "Over ran MAX_TIME running tasks. Last task "+task.scriptFile+" on page "+task.pageName+" Task "+i+" of "+schedule.length);
      }
      tooLong = true;
    }
  }
  
  openForum.storeValue( "/OpenForum/Triggers/TimerTrigger/TaskScheduler.started" , "" + now.getTime() );
  openForum.storeValue( "/OpenForum/Triggers/TimerTrigger/TaskScheduler.completed" , "" + new Date().getTime() );
  openForum.storeValue( "/OpenForum/Triggers/TimerTrigger/TaskScheduler.timeTaken" , "" + (new Date().getTime() - now.getTime()) );
  openForum.storeValue( "/OpenForum/Triggers/TimerTrigger/TaskScheduler.schedule.length" , "" + schedule.length );
  openForum.storeValue( "/OpenForum/Triggers/TimerTrigger/TaskScheduler.schedule" , "" + JSON.stringify( schedule ) );
  
  resultMessage += "Completed";
} catch(e) {
  logTaskMessage("Error in /OpenForum/Triggers/TimerTrigger/TaskScheduler/trigger.sjs Error:"+e);
  log.error("Error in /OpenForum/Triggers/TimerTrigger/TaskScheduler/trigger.sjs Error:" + e + " Running task " + JSON.stringify(task));
  var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
  Alert.triggerAlert("Task Scheduler Error","");

  resultMessage += "Error";
}

logToSchedulerQueue("Tasks completed.");

result = resultMessage + " " + new Date();

*/