try{

db = js.getApi("/OpenForum/JarManager/JDBC");

//Oracle Connection Definition
//db.registerDriver( "org.hsqldb.jdbcDriver","/OpenForum/JarManager/JDBC/HQSQL","hsqldb.jar" );
db.registerDriver("oracle.jdbc.OracleDriver","/OpenForum/JarManager/JDBC/Oracle","ojdbc14.jar");

var connectionName = "";
var schema = "";
var userName = "";
var password = "";

//db.createConnection(connectionName,"jdbc:oracle:thin:@"+schema,userName,password);
//db.createAdminConnection("jdbc:oracle:thin:@"+dbPath,alias);

//HSQLDB Connection Definition
//db.createConnection(connectionName,"jdbc:hsqldb:hsql://localhost:9001/"+schema,userName,password);

} catch(e) {
  file.saveAttachment("/OpenForum/JarManager/JDBC","exception.txt",new Date()+" "+e+" on line "+e.lineNumber);
}

