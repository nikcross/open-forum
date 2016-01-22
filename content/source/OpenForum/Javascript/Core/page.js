var buildScript;

OpenForum.init = function() {
  loadBuildScript();
};

function loadBuildScript() {
  buildScript = JSON.parse(OpenForum.loadFile("/OpenForum/Javascript/Core/open-forum.build.json"));
}

function saveBuildScript() {
  OpenForum.saveFile("/OpenForum/Javascript/Core/open-forum.build.json",JSON.stringify(buildScript,null,4));
}

function runBuildScript() {
  saveBuildScript();
  JSON.get("/OpenForum/Javascript/Builder","build",
                     "buildFile=/OpenForum/Javascript/Core/open-forum.build.json&json=true")
  .onSuccess( scriptComplete )
  .go();
}

function scriptComplete(result) {
  alert("Script completed. "+result);
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