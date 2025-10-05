// Version 2.0

try{

db = js.getApi("/OpenForum/AddOn/SQL");

//Oracle Connection Definition
db.registerDriver("org.postgresql.Driver","/OpenForum/AddOn/SQL","postgresql-9.4.1208.jre6.jar");
  
var config = JSON.parse( ""+file.getAttachment( "/OpenForum/Users/Admin", "sql.config" ) );
  
for(var d in config ) {
  db.createConnection( config[d].alias, config[d].url , config[d].user , config[d].password );
}
  
} catch(e) {
  log.error(e);
  throw e;
}
