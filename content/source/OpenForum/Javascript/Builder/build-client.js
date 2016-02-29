/*
* Author: Nik Cross
* Description: Uses the /OpenForum/Javascript/Builder to build js scripts
*/

if(typeof(buildScriptFile)==="undefined") {
  buildScriptFile = "script.build.json";
}

if(typeof(buildScriptPage)==="undefined") {
  buildScriptPage = pageName;
}

var buildScript;

OpenForum.init = function() {
  loadBuildScript();
};

function loadBuildScript() {
  buildScript = JSON.parse(OpenForum.loadFile(buildScriptPage+"/"+buildScriptFile));
}

function saveBuildScript() {
  OpenForum.saveFile(buildScriptPage+"/"+buildScriptFile,JSON.stringify(buildScript,null,4));
}

function runBuildScript() {
  saveBuildScript();
  JSON.get("/OpenForum/Javascript/Builder","build",
                     "buildFile="+buildScriptPage+"/"+buildScriptFile+"&json=true")
  .onSuccess( scriptComplete )
  .go();
}

function scriptComplete(response) {
  if(response.result=="ok") {
  	showPopup("Build completed. <br/>"+response.message);
  } else {
  	showPopup("Error. <br/>"+response.message);
  }
}

function incrementBuildVersion() {
  var parts = buildScript.version.split(".");  
  parts[2]++;
  buildScript.version = parts[0]+"."+parts[1]+"."+parts[2];
}

function incrementMinorVersion() {
  var parts = buildScript.version.split(".");  
  parts[1]++;
  buildScript.version = parts[0]+"."+parts[1]+"."+parts[2];
}

function incrementMajorVersion() {
  var parts = buildScript.version.split(".");  
  parts[0]++;
  buildScript.version = parts[0]+"."+parts[1]+"."+parts[2];
}

var popupStatus = "--";
function showPopup(message) {
  popupStatus = message.replaceAll("\n","<br/>");
  $('#statusModal').foundation('reveal', 'open');
}