/*
* Author: Nik Cross
* Description: Take a tsv file and converts to json using first row as field names in an array
*/

input = input.replace(/\s\s\s\s\s\s\s\s/g,"\t");
var lines = input.split("\n");

var fieldNames = lines[0].split("\t");

var json = "";
for(var i = 1; i<lines.length;i++) {
  var rowData = lines[i].split("\t");
  var rowJson = "";
  for(var f=0; f<fieldNames.length;f++) {
    var name = fieldNames[f];
    var value = rowData[f];
    if(rowJson.length>0) rowJson+=",";
    
    rowJson+="\""+name+"\": \""+value+"\"";
  }
  if(json.length>0) json+=",";
  json += "\n\t{"+rowJson+"}";
}

json = "[\n"+json+"]\n";
json = JSON.parse(json);
json = JSON.stringify(json,null,4);

output = json;