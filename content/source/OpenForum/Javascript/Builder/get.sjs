var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  var result = "";
  var HR = "//==============================================================================================================//\n";
  
  if(action === "build") {
    
    //var builder = js.getObject("/OpenForum/Javascript/Builder","Builder.object.js");
    var builder = js.getObject("/OpenForum/Javascript/Builder","Builder.object.js");
    var build = builder.getBuild();
    build.JSON = JSON;
    build.file = file;
    
    build.loadBuildScript(transaction.getParameter("buildFile"));
    build.setBuildParameter("targetFile",transaction.getParameter("targetFile"));
    build.setBuildParameter("version",transaction.getParameter("version"));
    
    build.build();
    
    result = JSON.stringify({result: "ok", message: "Built "+build.getBuildParameter("targetFile")+" and "+build.getBuildParameter("versionedTargetFile")});
  } else {
      result = "action not recognised";
  }

  transaction.sendPage( result );