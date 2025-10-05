/*
* Author: 
*/
OpenForum.loadCSS("/OpenForum/Extensions/DataTable/data-table.css");
OpenForum.includeScript("/OpenForum/AddOn/Tagging/TaggingClient.js");
OpenForum.includeScript("/OpenForum/Triggers/TimerTrigger/TaskScheduler/TaskSchedulerClient.js");
OpenForum.includeScript("/OpenForum/Triggers/TimerTrigger/TaskScheduler/Logs/LogsClient.js");

var VERSION = "";
var schedule = [];
var taskTemplate = {"id": "", "name": "", "pagename": "", "scriptfile": "", "lastrun": "", "scheduledtime": "", "enabled": true, "debug": false};
var currentTask = createTask();
var addTaskText = "Add Task";

var updateTime = new Date().getDisplayString();
var sortAscending = false;
var tags = [];

var taskScheduler = {
  timeTaken: "--",
  scheduleLength: "--"
};

var ready = false;

OpenForum.init = function() {

  TaggingClient.getTags(  function(response) {  tags = response.data; } );

  OpenForum.loadJSON("/OpenForum/Triggers/TimerTrigger/TaskScheduler/release-info.json",function(data) {
    VERSION = data.version;
  }, true);

  ready = true;

  loadSchedule();

  OpenForum.getObject("nameFilter").addListener(updateRowFilter);
  OpenForum.getObject("pageNameFilter").addListener(updateRowFilter);
  OpenForum.getObject("scheduledTimeFilter").addListener(updateRowFilter);
  OpenForum.getObject("enabledFilter").addListener(updateRowFilter);
  OpenForum.getObject("debugFilter").addListener(updateRowFilter);
  OpenForum.getObject("tagFilter").addListener( function() { loadSchedule(); updateRowFilter(); } );
  enabledFilter = true;
  //This was required to reapply filters after table updates
  OpenForum.addScanner( updateRowFilter );
};

function updateRowFilter() {
  if(typeof nameFilter == "undefined") return;

  enabledFilterValue = "t";
  if( enabledFilter == false ) enabledFilterValue = "f";
  debugFilterValue = "t";
  if( debugFilter == false ) debugFilterValue = "f";
  
  OpenForum.Table.applyRowFilter("schedule",schedule, [ 
    {fieldName: "name", fieldFilter: nameFilter}, 
    {fieldName: "pagename", fieldFilter: pageNameFilter}, 
    {fieldName: "scheduledtime", fieldFilter: scheduledTimeFilter}, 
    {fieldName: "enabled", fieldFilter: enabledFilterValue}, 
    {fieldName: "debug", fieldFilter: debugFilterValue}
  ] );
}

function loadSchedule() {
  if(ready == false) return;

  var tag = null;
  if( tagFilter != "") {
    tag = tagFilter;
  }

  TaskSchedulerClient.getSchedule( tag, 
                                  function(response) {
    schedule = response.data;
    for(var s in schedule) {
      if(schedule[s].enabled=="t") {
        schedule[s].enabled_VIEW = "Enabled";
      } else {
        schedule[s].enabled_VIEW = "Disabled";
      }
      if(schedule[s].debug=="t") {
        schedule[s].debug_VIEW = "Debug On";
      } else {
        schedule[s].debug_VIEW = "Debug Off";
      }
    }
    updateTime = new Date().getDisplayString();
  }
                                 );

  LogsClient.getTaskSchedulerTime(  function(response) {
    taskScheduler.timeTaken = response.data.timeTaken;
    taskScheduler.scheduleLength = response.data.scheduleLength;
  } );
}

function errorSchedule(error) {
  alert(error);
}

function editTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.name===taskId) {
      currentTask = task;
      enabledCheckBox = currentTask.enabled;
      debugCheckBox = currentTask.debug;
      addTaskText = "Update Task";
      break;
    }
  }

  $('#taskEdit').foundation('reveal', 'open');
}

function showTagTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.name===taskId) {
      currentTask = task;
      break;
    }
  }

  $('#tagTask').foundation('reveal', 'open');
}

function tagTask() {
  TaggingClient.tag( currentTask.tag, "Task", currentTask.name, false, false, function() {
    alert( currentTask.name + " tagged with " + currentTask.tag );
  });
}

function runTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.name===taskId) {
      alert("Running "+task.pageName+"/"+task.scriptFile,"Please Wait...");
      JSON.get("","runTrigger","pageName="+task.pageName+"&triggerFile="+task.scriptFile).onSuccess(
        function(response) {
          if(response.error) {
            alert("Ran "+task.pageName+"/"+task.scriptFile,"Error: "+response.error);
          } else {
            alert("Ran "+task.pageName+"/"+task.scriptFile,"Time Taken: "+response.data.timeTaken+" milliseconds");
          }
        }
      ).go();
      break;
    }
  }
}

function deleteTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.name===taskId) {
      OFX.get("/OpenForum/Triggers/TimerTrigger/TaskScheduler").withAction("deleteTask").withData({taskName: task.name}).onSuccess(
        function(response) {}
      ).go();
      schedule.splice(i, 1);
      break;
    }
  }
}

function addTask() {

  currentTask.enabled = enabledCheckBox;
  currentTask.debug = debugCheckBox;

  OFX.get("/OpenForum/Triggers/TimerTrigger/TaskScheduler").withAction("addTask")
    .withData(
    {
      name: currentTask.name,
      pagename: currentTask.pagename,
      scriptfile: currentTask.scriptfile,
      lastrun: currentTask.lastrun,
      scheduledtime: currentTask.scheduledtime,
      enabled: currentTask.enabled,
      debug: currentTask.debug
    }
  ).onSuccess(
    function() {}
  ).go();

  loadSchedule();
}

function createTask() {
  currentTask = JSON.parse( JSON.stringify(taskTemplate) );
  addTaskText = "Add Task";
  return currentTask;
}