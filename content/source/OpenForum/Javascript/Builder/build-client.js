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

function addAppendStep() {
  OpenForum.scan();
  buildScript.steps.push( {action: "append", fileName: buildScriptNewSourceFile} );
  buildScriptNewSourceFile = "";
  OpenForum.scan();
}

function loadBuildScript() {
  try{
    if(OpenForum.fileExists(buildScriptPage+"/"+buildScriptFile)==false) {
      var fileName = buildScriptPage.substring(buildScriptPage.lastIndexOf("/")+1)+".js";
      buildScript = {version: "0.0.0",targetFile: buildScriptPage+"/"+fileName, versionFile: buildScriptPage+"/Version/"+fileName,steps: [], script: ""};
      buildScriptNewSourceFile = "";
      OpenForum.scan();
      $('#buildScriptModal').foundation('reveal', 'open');
      return;
    }
    
  	buildScript = JSON.parse(OpenForum.loadFile(buildScriptPage+"/"+buildScriptFile));
    buildScript.script = buildScript.script.replaceAll("<","&lt;").replaceAll(">","&gt;");
  } catch(e) {
    console.log(e);
  }
}

function saveBuildScript(fn) {
  if(!fn) {
    fn = function(){ alert("Saved build script" + buildScriptPage+"/"+buildScriptFile,"Javascript Builder"); };
  }
  OpenForum.saveFile(
    buildScriptPage+"/"+buildScriptFile,JSON.stringify(buildScript,null,4),fn
  );
}

function runBuildScript() {
  OpenForum.scan();
  saveBuildScript(
    function() {
      OFX.get("/OpenForum/Javascript/Builder")
        .withAction("build")
        .withData( {buildFile: buildScriptPage+"/"+buildScriptFile, json: true} )
        .onSuccess( scriptComplete )
        .go();
    }
  );
}

function scriptComplete(response) {
  if(response.result=="ok") {
  	showPopup("Build completed. <br/>"+response.message);
    buildScript.script = response.script.replaceAll("<","&lt;").replaceAll(">","&gt;");
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
  parts[2] = 0;
  buildScript.version = parts[0]+"."+parts[1]+"."+parts[2];
}

function incrementMajorVersion() {
  var parts = buildScript.version.split(".");  
  parts[0]++;
  parts[1] = 0;
  parts[2] = 0;
  buildScript.version = parts[0]+"."+parts[1]+"."+parts[2];
}

var popupStatus = "--";
function showPopup(message) {
  popupStatus = message.replaceAll("\n","<br/>");
  $('#statusModal').foundation('reveal', 'open');
}