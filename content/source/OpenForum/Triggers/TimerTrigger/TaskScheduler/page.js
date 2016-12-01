/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/AddOn/SQL/DB.js");

var db;
var schedule;
var taskTemplate = {"id": "", "name": "", "pageName": "", "scriptFile": "", "lastRun": "", "scheduledTime": "", "enabled": true, "debug": false};
var currentTask = createTask();

OpenForum.init = function() {
  db = new DB("open-forum");
  loadSchedule();
};


function loadSchedule() {
  db.query("select * from triggerSchedule order by name",updateSchedule,errorSchedule);
}

function errorSchedule(error) {
  alert(error);
}

function updateSchedule(newSchedule) {
    var list = [];
    for(var i in newSchedule.table.rows) {
      var row = newSchedule.table.rows[i];
      var entry = {
        id: "task"+i,
        name: row.cell0,
        pageName: row.cell1,
        scriptFile: row.cell2,
        lastRun: row.cell3,
        scheduledTime: row.cell4,
        enabled: (row.cell5=="t"),
        debug: (row.cell6=="t")
      };
      list.push(entry);
    }
  schedule = list;
}

function editTask(taskId) {
  for(var i in schedule) {
    var task = schedule[i];
    if(task.id===taskId) {
      currentTask = task;
      document.getElementById("enabledCheckBox").checked = currentTask.enabled;
      document.getElementById("debugCheckBox").checked = currentTask.debug;
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
  
  currentTask.enabled = document.getElementById("enabledCheckBox").checked;
  currentTask.debug = document.getElementById("debugCheckBox").checked;
  
  var sql = "insert into triggerSchedule values("+
      "'" + currentTask.name+"','"+
      currentTask.pageName+"','"+
      currentTask.scriptFile+"','"+
      currentTask.lastRun+"','"+
      currentTask.scheduledTime+"',"+
      currentTask.enabled+","+
      currentTask.debug+")"+
      " ON CONFLICT (name) DO UPDATE SET "+
      " name = '"+
      currentTask.name+"', pageName = '"+
      currentTask.pageName+"', scriptFile = '"+
      currentTask.scriptFile+"', lastRun = '"+
      currentTask.lastRun+"',scheduledTime = '"+
      currentTask.scheduledTime+"', enabled = "+
      currentTask.enabled+", debug = "+
      currentTask.debug;
      
  console.log(sql);
  
  //sql,callBack,errorCallBack
  db.execute(
    sql,
    alert,
    alert
  );
  
  loadSchedule();
}

function createTask() {
  return JSON.parse( JSON.stringify(taskTemplate) );
}