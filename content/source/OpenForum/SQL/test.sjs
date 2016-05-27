/*
* Author: 
* Description: 
*/

  var dbName = "rensmart-weather";
  var db = js.getApi("/OpenForum/SQL");
  
println( "db:"+db );
db.createConnection("rensmart-weather","jdbc:postgresql://rensmart-weather-db:5432/rensmart-weather","rensmart","rw-password");

var connections = db.getConnections();
for(var i=0;i<connections.length;i++) {
  println("cnx: "+connections[i]);
}
println( "cnxs:"+connections.length );

/*
var sql = "create table metar ( log_entry varchar(600) )";
println("SQL:"+sql);

try{
  var queryResult = ""+db.execute(dbName,sql);
} catch(e) {
  println("Exception:"+e);
}
*/

//var sql = "select log_entry from metar";
var sql = "select log_entry from metar";
println("SQL:"+sql);

try{
  var queryResult = ""+db.query(dbName,sql);
println("Run");
} catch(e) {
  println("Exception:"+e);
}
