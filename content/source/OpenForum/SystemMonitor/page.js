var MEG = 1000000;
var GIG = 1000000000;
var system = {};
var state = {};

OpenForum.init = function() {
  JSON.get("/OpenForum/SystemMonitor","getSystem","json=true").onSuccess( function(response) { system=response; } ).go();
  
  setInterval(updateState,1000,1000);
};
  
function updateState() {
  JSON.get("/OpenForum/SystemMonitor","getState","json=true").onSuccess( processState ).go();  
}

function processState(response) {
  response.memory.total = formatAsMeg(response.memory.total);
  response.memory.free = formatAsMeg(response.memory.free);
  response.memory.pcFree = formatAsPercent(response.memory.free,response.memory.total);
  
  response.disk.total = formatAsMeg(response.disk.total);
  response.disk.free = formatAsMeg(response.disk.free);
  response.disk.pcFree = formatAsPercent(response.disk.free,response.disk.total);
  
  response.systemTime = new Date(parseInt(response.systemTime,10));
  response.startTime = new Date(parseInt(response.startTime,10));
  
  state = response;
}

function formatAsMeg(value) {
  return Math.round((value*10)/MEG)/10;
}

function formatAsPercent(value,total) {
  return Math.ceil((value*1000)/total)/10;
}