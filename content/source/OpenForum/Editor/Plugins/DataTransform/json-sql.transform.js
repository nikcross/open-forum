var name = input.split("\n")[0];
var json = input.substring( input.indexOf("\n")+1 );
var json = JSON.parse(json);

var selectOneTemplate = OpenForum.loadFile("/OpenForum/AddOn/SQL/select-one-template.js.txt");
var parts = selectOneTemplate.match(/8<.*8</g,"");
selectOneTemplate = selectOneTemplate.replace(/8<.*8</g,"");
var selectStringTemplate = parts[0].between("8<---","---8<");
var selectNumberTemplate = parts[1].between("8<---","---8<");

var selectManyTemplate = OpenForum.loadFile("/OpenForum/AddOn/SQL/select-many-template.js.txt");
selectManyTemplate = selectManyTemplate.replace(/8<.*8</g,"");

var insertTemplate = OpenForum.loadFile("/OpenForum/AddOn/SQL/insert-template.js.txt");
parts = insertTemplate.match(/8<.*8</g,"");
insertTemplate = insertTemplate.replace(/8<.*8</g,"");
var insertStringTemplate = parts[0].between("8<---","---8<");
var insertNumberTemplate = parts[1].between("8<---","---8<");

var updateTemplate = OpenForum.loadFile("/OpenForum/AddOn/SQL/update-template.js.txt");
parts = updateTemplate.match(/8<.*8</g,"");
updateTemplate = updateTemplate.replace(/8<.*8</g,"");
var updateStringTemplate = parts[0].between("8<---","---8<");
var updateNumberTemplate = parts[1].between("8<---","---8<");

var createTable = "";
var selectOne = "";
var selectMany = "";
var insert = "";
var update = "";

var index = 0;
for(i in json) {
  if(createTable.length!==0) {
    createTable += ",\n";
    selectOne += ",\n";
    insert += ",";
    update += ",";
  }
  
  type = "text";
  if(json[i]!==" " && isNaN(json[i])==false) type="bigint";
  createTable += "\t"+i+" "+type;
  
  if(type=="text") {
  	selectOne += selectStringTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  	insert += insertStringTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  	update += insertStringTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  } else {
  	selectOne += selectNumberTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  	insert += insertNumberTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  	update += insertNumberTemplate.replaceAll("&fieldName;",i).replaceAll("&index;",index);
  }
  
  index++;
}

createTable = "create table "+name+" (\n" + createTable + "\n)\n";

selectMany = selectManyTemplate.replaceAll("&tableName;",name).replaceAll("&fields;",selectOne);
selectOne = selectOneTemplate.replaceAll("&tableName;",name).replaceAll("&fields;",selectOne);
insert = insertTemplate.replaceAll("&fields;",insert).replaceAll("&tableName;",name);
update = updateTemplate.replaceAll("&fields;",update).replaceAll("&tableName;",name);

output = createTable+
  "\n\n------\n"+selectOne+
  "\n\n------\n"+selectMany+
  "\n\n------\n"+insert+
  "\n\n------\n"+update;