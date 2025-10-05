/*
* Author: 
*/

var scripts = [];
var nodes = [];
var requestedScripts = [];

var selectedScript = "--";
var scriptCode = "--";
var selectedNode = "--";
var showSend = false;

OpenForum.init = function() {
  setTimeout(updateAll,10000);
  updateAll();
};

function updateAll() {
  checkSend();
  updateScripts();
  updateNodes();
  updateRequestedScripts();
  
  setTimeout(updateAll,10000);
}


function updateScripts() {
  JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getScriptsList").onSuccess(setScripts).go();
}

function setScripts(response) {
  scripts = response.attachments;
}

function updateRequestedScripts() {
  JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getRequestedScriptsList").onSuccess(setRequestedScripts).go();
}

function setRequestedScripts(response) {
  requestedScripts = response.attachments;
}

function updateNodes() {
  JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","getNodesList").onSuccess(setNodes).go();
}

function setNodes(response) {
  nodes = response.nodes;
}

function selectScript(script) {
  selectedScript = script;
  scriptCode = OpenForum.loadFile("/OpenForum/AddOn/DataLogger/RequestedScripts/"+selectedScript);
  checkSend();
}

function selectNode(node) {
  selectedNode = node;
  checkSend();
}

function checkSend() {
  if(selectedNode!=="--" && selectedScript!=="--") {
    OpenForum.showElement("send");
  } else {
    OpenForum.hideElement("send");
  }
}

function sendScript() {
  JSON.get("/OpenForum/AddOn/DataLogger/RequestedScripts","sendScript","script="+selectedScript+"&node="+selectedNode).onSuccess(updateAll).go();
  
  selectedScript = "--";
  scriptCode = "--";
  selectedNode = "--";
}
