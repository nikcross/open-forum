var fields = input.split("\n");

var json = {};
for(var i in fields) {
  var field = fields[i];
  var value = " ";
  if(field.indexOf(" ")!=-1) {
    value = field.split(" ")[1];
    field = field.split(" ")[1];
  }
  
  if( parseNumber(value).isNaN()==false ) value =  parseNumber(value);
  json[field] = value;
    
}

output = JSON.stringify(json,null,4);