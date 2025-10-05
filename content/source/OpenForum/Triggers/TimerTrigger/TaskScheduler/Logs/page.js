/*
* Author: Admin 
*/
OpenForum.includeScript("/OpenForum/Triggers/TimerTrigger/TaskScheduler/Logs/LogsClient.js");

var taskScheduler = {
  timeTaken: "--",
  scheduleLength: "--"
};
var schedule = [];

OpenForum.init = function() {
  loadLogView();

  setInterval( updateView, 10000);
  updateView();

};

function updateView() {
  LogsClient.getTaskSchedulerTime(  function(response) {
    taskScheduler = response.data;
  } );
  
  LogsClient.getScheduleView(  function(response) {
    schedule = [];
    for(var i in response.data) {
    	schedule.push( response.data[i] );
    }
  } );
}

function loadLogView() {
  var date = new Date();
  var logFileDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

  if(OpenForum.fileExists("/OpenForum/Triggers/TimerTrigger/TaskScheduler/Logs/"+logFileDate+"-task-log.txt")) {
    OpenForum.loadFile("/OpenForum/Triggers/TimerTrigger/TaskScheduler/Logs/"+logFileDate+"-task-log.txt",function(data){ 
      var logViewData = data.replaceAll("\n","<br/>\n");
      OpenForum.setElement( "logView",logViewData );
    },true);
  }

  //setTimeout(loadLogView,10000);
}