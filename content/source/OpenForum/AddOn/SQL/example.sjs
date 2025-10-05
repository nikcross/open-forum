println("Started");
db = js.getApi("/OpenForum/AddOn/SQL");
try{
//db.createConnection("open-forum","jdbc:postgresql://open-forum-db:5432/open-forum","open-forum","of-password");
//db.createConnection("rensmart-weather","jdbc:postgresql://rensmart-weather-db:5432/rensmart-weather","rensmart","rw-password");
//db.createConnection("rensmart-com","jdbc:postgresql://rensmart-com-db:5432/rensmart-com","rensmart","rw-password");

  var list = db.getConnections();
  println( typeof(list) );
  
} catch(e) { println("Error "+e); }
println("Done it");

/*
var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
DB.setAlias("rensmart");
println(DB.getConnections().length);
println("Loaded DB. UserName.:"+DB.getUserName());
//connection = db.getConnection("testEvents");

result = DB.query("select count(*) from member");

println("Done SQL. "+result);*/