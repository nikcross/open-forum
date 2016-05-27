try{

db = js.getApi("/OpenForum/SQL");

//Oracle Connection Definition
db.registerDriver("oracle.jdbc.OracleDriver","/OpenForum/SQL","ojdbc14.jar");
db.registerDriver("org.postgresql.Driver","/OpenForum/SQL","postgresql-9.4.1208.jre6.jar");
  
//db.createConnection("testEvents","jdbc:oracle:thin:@//localhost:1521/XE","????","????");
db.createConnection("rensmart-weather","jdbc:postgresql://rensmart-weather-db:5432/rensmart-weather","rensmart","rw-password");

} catch(e) {
  file.saveAttachment("/OpenForum/SQL","exception.txt",new Date()+" "+e+" on line "+e.lineNumber);
}
