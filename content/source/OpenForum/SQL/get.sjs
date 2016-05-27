var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};


  if(action==="query") {
    var dbName = ""+transaction.getParameter("db");
    var db = js.getApi("/OpenForum/SQL");

    var sql = ""+transaction.getParameter("SQL");
    var queryResult = ""+db.query(dbName,sql);
    queryResult = JSON.parse( "{"+queryResult+"}" );

    result = {result: "ok", message: "ran query "+sql+" against "+dbName, queryResult: queryResult};
  } else if(action==="execute") {
    var dbName = ""+transaction.getParameter("db");
    var db = js.getApi("/OpenForum/SQL");

    var sql = ""+transaction.getParameter("SQL");
    var queryResult = ""+db.execute(dbName,sql);  
    queryResult = JSON.parse( "{state: "+queryResult+"}" );

    result = {result: "ok", message: "ran "+sql+" against "+dbName, queryResult: queryResult};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
