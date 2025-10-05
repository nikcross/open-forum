/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var fileActions = [
  {name: "Code", description:"Generate Code", fn: "generateCode", icon: "script_go"}
];

var editor;
var tableName = "";
var output = "";

OpenForum.init = function() {
  var editorConfig = {
    flavour: "Javascript",
    editingPageName: "/OpenForum/AddOn/SQL/Generator",
    editingFileName: "example.json",
    retrieve: false,
    fileExtension: "json",
    elementId: "jsonEditor"
  };

  editor = new StandaloneEditor( editorConfig );
  editor.onLoad = function() {
    OpenForum.setElement("editorButtons","<li><a href='#' onClick='generateCode(); return false;'>Generate Code</a></li>");
  };
};

function generateCode(newTableName,json) {
  OpenForum.scan();
  if(!newTableName) newTableName = tableName;
  if(!json) {
    try{
    	json = JSON.parse(editor.getValue());
    } catch(e) {
      output = ""+e;
    }
  }

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
  
  var sequenceTemplate = OpenForum.loadFile("/OpenForum/AddOn/SQL/sequence-template.js.txt");

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

  createTable = "create table "+newTableName+" (\n" + createTable + "\n)\n";

  selectMany = selectManyTemplate.replaceAll("&tableName;",newTableName).replaceAll("&fields;",selectOne);
  selectOne = selectOneTemplate.replaceAll("&tableName;",newTableName).replaceAll("&fields;",selectOne);
  insert = insertTemplate.replaceAll("&fields;",insert).replaceAll("&tableName;",newTableName);
  update = updateTemplate.replaceAll("&fields;",update).replaceAll("&tableName;",newTableName);
  var createSequence = sequenceTemplate.replaceAll("&tableName;",newTableName);

  output = createTable+
    "\n\n#---Create Sequence---\n"+createSequence+
    "\n\n#---Select On---\n"+selectOne+
    "\n\n#---Select Many---\n"+selectMany+
    "\n\n#---Insert---\n"+insert+
    "\n\n#---Update---\n"+update;
}