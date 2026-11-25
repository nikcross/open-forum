/*
* Author: Admin 
* Description: 
*/
//Separate the csv rows
var rows = input.split("\n");
var DELIMITER = "\t"; //Use "\t" for tab separated

output = "";

print("Rows:" + rows.length);

var template = "INSERT INTO triggerschedule (enabled ,debug ,scriptfile "+
    ",name ,scheduledtime ,lastrun ,pagename "+
    ") values (true,false,'{scriptFile}','{name}','{scheduledTime}','','{pageName}');";

for(var r in rows) {
  //Ignore the title row
  if( r==0 ) continue;
  
  //Separate each row into a row of cells
  var cells = rows[r].split(DELIMITER);
  
  var sql = (""+template)
  		.replace("{name}",cells[0])
  		.replace("{scriptFile}",cells[2])
  		.replace("{scheduledTime}",cells[4])
  		.replace("{pageName}",cells[1]);
  
  //Create a list of cells
  /*for(var c in cells) {
  	output += cells[c] + " : ";  
  }*/
  
  output += sql+"\n\n";
}

//Add a message to the log
print("I've finished");
