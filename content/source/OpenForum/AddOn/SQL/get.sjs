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
    var db = js.getApi("/OpenForum/AddOn/SQL");

    var sql = ""+transaction.getParameter("SQL");
    
    try{
      var queryResult = ""+db.query(dbName,sql);
      queryResult = JSON.parse( "{"+queryResult+"}" );

      result = {result: "ok", message: "ran query "+sql+" against "+dbName, sql: sql, queryResult: queryResult};
    } catch(e) {
      e = ""+e;
      if(e.indexOf("ERROR: ")!=-1) {
      	e = e.substring(e.indexOf("ERROR: ")+7);
      }
      result = {result: "dbError", message: "ran query "+sql+" against "+dbName, error: e};
    }
  } else if(action==="execute") {
    var dbName = ""+transaction.getParameter("db");
    var db = js.getApi("/OpenForum/AddOn/SQL");

    var sql = ""+transaction.getParameter("SQL");
    var queryResult = ""+db.execute(dbName,sql);  
    queryResult = JSON.parse( "{state: "+queryResult+"}" );

    result = {result: "ok", message: "ran "+sql+" against "+dbName, sql: sql, queryResult: queryResult};
  } else if(action==="getConnections") {
    var db = js.getApi("/OpenForum/AddOn/SQL");
    var connections = db.getConnections();
    var jsConnections = [];
    for(var i=0;i<connections.length;i++) jsConnections.push( ""+connections[i] );
    result = {result: "ok", connections: jsConnections };
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
