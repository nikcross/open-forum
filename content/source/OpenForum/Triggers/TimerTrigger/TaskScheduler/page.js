/*
* Author: 
*/

var schedule;
var taskTemplate = {"id": "", "name": "", "pageName": "", "scriptFile": "", "lastRun": "", "scheduledTime": "", "enabled": true, "debug": false};
var currentTask = createTask();

OpenForum.init = function() {
  loadSchedule();
};


function loadSchedule() {
  OpenForum.loadFile("/OpenForum/Triggers/TimerTrigger/TaskScheduler/schedule.json",updateSchedule );
}

function saveSchedule() {
  if(validateSchedule()===true) {
    OpenForum.saveFile("/OpenForum/Triggers/TimerTrigger/TaskScheduler/schedule.json",JSON.stringify(schedule,null,4));
  }
}

function validateSchedule() {
  return true;
}

function updateSchedule(newSchedule) {
  schedule = JSON.parse(newSchedule);
}

function editTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.id===taskId) {
      currentTask = task;
      break;
    }
  }
}

function deleteTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.id===taskId) {
      schedule.splice(i, 1);
      break;
    }
  }
}

function addTask() {
  currentTask = createTask();
  currentTask.id = "task"+schedule.length;
  schedule.push( currentTask );
}

function createTask() {
  return JSON.parse( JSON.stringify(taskTemplate) );
}