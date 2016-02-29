var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action; // Cast to String
  var result = {};
  var HR = "//==============================================================================================================//\n";
  
  if(action === "build") {
    
    //var builder = js.getObject("/OpenForum/Javascript/Builder","Builder.object.js");
    var builder = js.getObject("/OpenForum/Javascript/Builder","Builder.object.js");
    var build = builder.getBuild();
    build.JSON = JSON;
    build.file = file;
    
    build.loadBuildScript(transaction.getParameter("buildFile"));
    build.setBuildParameter("targetFile",transaction.getParameter("targetFile"));
    build.setBuildParameter("versionFile",transaction.getParameter("targetFile"));
    build.setBuildParameter("versionFile",transaction.getParameter("versionFile")); // Override if present
    build.setBuildParameter("version",transaction.getParameter("version"));
    
    build.build();
    
    result = {result: "ok", message: "Built "+build.getBuildParameter("targetFile")+" and "+build.getBuildParameter("versionedTargetFile")};
  } else {
    result = { result: "error", message: "Action "+action+" not recognised"};
  }
} catch(e) {
    result = { result: "error", message: ""+e+" at "+e.lineNumber};
}
  transaction.sendJSON( JSON.stringify(result) );