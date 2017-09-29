var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

action = ""+action;
result = {result: "error", message: "action "+action+" not recognised"};

if(action==="runTest") {
  var scriptFile = transaction.getParameter("testScript");
  var pageName = transaction.getParameter("pageName");
  if( scriptFile==null ) {
    scriptFile = "default-page-builder.test.sjs";
    pageName = "/OpenForum/Javascript/PageBuilder";
  } else {
    scriptFile = ""+scriptFile;
    pageName = ""+pageName;
  }
  
  var script = file.getAttachment(pageName,scriptFile);
  js.startJavascript(pageName+"/"+scriptFile,script);
  
  result = {result: "ok", message: "Running test"};
}

transaction.sendJSON( JSON.stringify(result) );