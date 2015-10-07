db = js.getApi("/OpenForum/SQL");
//connection = db.getConnection("testEvents");

result = db.query("testEvents","select count(*) from event");
file.saveAttachment("/Sandbox","events.txt",result);

println("Done SQL");