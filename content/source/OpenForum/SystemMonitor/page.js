OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.includeScript("/OpenForum/SystemMonitor/graph.js");

var MEG = 1000000;
var GIG = 1000000000;
var system = {};
var state = {};
var server = {};

var processorLoadData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var memoryFreeData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

OpenForum.init = function() {
  JSON.get("/OpenForum/SystemMonitor","getSystem","json=true").onSuccess( function(response) { system=response; } ).go();

  initGraph();

  setInterval(updateState,1000,1000);
  setInterval(updateServerState,5000,5000);
};

function updateState() {
  JSON.get("/OpenForum/SystemMonitor","getState","json=true").onSuccess( processState ).go();  
}


function updateServerState() {
  JSON.get("/OpenForum/SystemMonitor","getServer","json=true").onSuccess( processServerState ).go();  
}

function initGraph() {
  var giraffe = { canvas: null };

  giraffe.canvas = new Canvas("performanceGraph");
  Giraffe.setAnimated(giraffe.canvas);
  Giraffe.Interactive.setInteractive(giraffe.canvas);
  giraffe.canvas.startAnimation(5,1000,true);

  var options = {
    x: 0,
    y: 0,
    width: 500,
    height: 300,
    fillColor: "rgba(150,200,50,0.7)",
    color: "green",
    font: "Arial",
    margin: {top: 20, bottom: 20, right: 100, left: 100},
    fontSize: 10,
    tickSize: 6,
    style: "area", //line, sparkline or area

    showPoints: false,
    showVertices: true,

    xLabels: false,
    yAxis: {min: 0, max: 200, steps: 10}
  };
  
  var graph = new Graph(processorLoadData,options);
  graph.addDataSet(memoryFreeData,{ color: "blue", fillColor: "rgba(50,50,200,0.7)"});
  graph.setAnimated();
  
  giraffe.canvas.add( graph.getView() );
}

function processServerState(response) {
  server = response;
}

function processState(response) {
  response.memory.total = formatAsMeg(response.memory.total);
  response.memory.free = formatAsMeg(response.memory.free);
  response.memory.pcFree = formatAsPercent(response.memory.free,response.memory.total);

  response.disk.total = formatAsMeg(response.disk.total);
  response.disk.free = formatAsMeg(response.disk.free);
  response.disk.pcFree = formatAsPercent(response.disk.free,response.disk.total);

  response.systemTime = new Date(parseInt(response.systemTime,10)).toString();
  response.startTime = new Date(parseInt(response.startTime,10)).toString();

  state = response;
  
  for(var i=1; i<processorLoadData.length; i++) {
    processorLoadData[i-1] = processorLoadData[i];
    memoryFreeData[i-1] = memoryFreeData[i];
  }
  memoryFreeData[memoryFreeData.length-1] = response.memory.pcFree;
  processorLoadData[processorLoadData.length-1] = state.processor.load;
}

function formatAsMeg(value) {
  return Math.round((value*10)/MEG)/10;
}

function formatAsPercent(value,total) {
  return Math.ceil((value*1000)/total)/10;
}