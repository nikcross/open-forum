var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

action = ""+action;
result = {result: "error", message: "action "+action+" not recognised"};

if(action==="runTest") {
  //var script = file.getAttachment("/OpenForum/Javascript/Renderer","DefaultRenderer.test.sjs");
  var script = file.getAttachment("/OpenForum/Javascript/PageBuilder","default-page-builder.test.sjs");
  js.startJavascript("/OpenForum/Javascript/PageBuilder/default-page-builder.test.sjs",script);
  
  result = {result: "ok", message: "Running test"};
}

transaction.sendJSON( JSON.stringify(result) );