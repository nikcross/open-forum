dataTransform.imp("sandbox.java");

var json = {};
var java = "";

lines = input.split("\n");
for(var l in lines) {
  var line = lines[l].trim();
  if(line.indexOf("//")!=-1) {
    line = line.substring(0,line.indexOf("//"));
  }
  if(line.indexOf("private static")!=0) continue;
  line = line.substring(15);
  if(line.indexOf("final")==0) line = line.substring(6);
  var parts = line.split("=");

  parts[0] = parts[0].substring( parts[0].indexOf(" ") ).trim();
  parts[1] = parts[1].substring(0,parts[1].indexOf(";")).trim();

  if(isNaN(parts[1])) {
    if(parts[1].indexOf("\"")==0) parts[1] = parts[1].substring(1,parts[1].length-1);
    json[parts[0]] = parts[1];
    
    java += parts[0] + " = json.getChild(\""+parts[1]+"\").getValue();\n";
  } else {
    json[parts[0]] = parseInt(parts[1]);
    java += parts[0] + " = Integer.parseInt(json.getChild(\""+parts[1]+"\").getValue());\n";
  }

  if(line.length==0) continue;
}


  output = JSON.stringify(json,null,4);
  output +="\n\n";
  output += java;