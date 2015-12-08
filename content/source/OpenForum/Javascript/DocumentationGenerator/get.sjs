var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

action = ""+action;
result = {result: "error", message: "Action not recognised"};

if(action==="buildDocumentation") {
  var objectName=transaction.getParameter("objectName");
  
  var HelpPageGenerator = js.getObject("/OpenForum/Javascript/DocumentationGenerator","HelpPageGenerator.js");
  HelpPageGenerator.setObjectName(objectName);
  
  transaction.sendPage( HelpPageGenerator.generateHelpPage() );
  return;
}

transaction.sendJSON( JSON.stringify(result) );
