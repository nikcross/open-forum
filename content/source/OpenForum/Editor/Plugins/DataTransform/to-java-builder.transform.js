/*
* Author: Nik Cross
* Description: Takes class name and list of fields and makes into builder class.
* It's clunky but reduces typing.
* First item in list is taken to be class name
* Order of list is taken to be order in constructor
* Assumes all fields are strings
*/

function toClassName(name) {
  return name.charAt(0).toUpperCase()+name.substring(1);
}

var lines = input.split("\n");
var className = lines[0];

var data = "public class "+className+"Builder {\n";

data += "public static "+className+"Builder valid"+className+"() {\n";
data += "    return new "+className+"Builder().\n";

for(var i=1;i<lines.length;i++) {
  data += "      with"+toClassName(lines[i])+"(\""+lines[i]+"\").\n";
}

data += "}\n";

for(var i=1;i<lines.length;i++) {
  data += "  private String "+lines[i]+";\n";
}

for(var i=1;i<lines.length;i++) {
  data += "public "+className+"Builder with"+toClassName(lines[i])+"( String "+lines[i]+") {\n";
  data += "    this."+lines[i]+"="+lines[i]+";\n";
  data += "    return this;\n";
  data += "}\n";
}

data += "public "+className+" build() {\n";

data += "    return new "+className+"(\n";
for(var i=1;i<lines.length;i++) {
  data += "      "+lines[i]+",\n";
}
data += ");\n";
data += "    }\n";

data += "}\n";

data+="};";

output = data;