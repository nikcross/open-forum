  var fields = input.split("\n");
var json = {};
for(var i in fields) {
  var field = fields[i];
  var value = " ";
  if(field.split(" ").length!=1) {
    value = field.split(" ")[1];
    field = field.split(" ")[0];
  }
  
  if( value!==" " && isNaN(value)==false ) {
    value = parseFloat(value);
  }
  json[field] = value;
}

output = JSON.stringify(json,null,4);