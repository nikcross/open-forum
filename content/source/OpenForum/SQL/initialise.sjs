try{

db = js.getApi("/OpenForum/SQL");

//Oracle Connection Definition
db.registerDriver("oracle.jdbc.OracleDriver","/OpenForum/SQL","ojdbc14.jar");

//db.createConnection("testEvents","jdbc:oracle:thin:@//localhost:1521/XE","????","????");

} catch(e) {
  file.saveAttachment("/OpenForum/SQL","exception.txt",new Date()+" "+e+" on line "+e.lineNumber);
}
