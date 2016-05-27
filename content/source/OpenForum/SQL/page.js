OpenForum.includeScript("/OpenForum/SQL/DB.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var fileActions = [
  {name: "Run", description:"Run Script", fn: "runScript", icon: "script_go"}
];

var editor;

OpenForum.init = function() { 

  var editorConfig = {
    flavour: "Default",
    editingPageName: "/TheLab/Sandbox",
    editingFileName: "sandbox.sql",
    elementId: "sqlEditor"
  };
  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
    editorConfig.editingFileName = "page.content";
    editorConfig.autoSave = false;
  }

  editor = new StandaloneEditor( editorConfig );
};

function runScript() {
  var db = new DB("rensmart-weather");
  var sql = editor.getValue();
  
  var command = sql.toLowerCase().split(" ")[0];
  if(command==="select") {
    db.query( sql,showResultTable );
  } else {
    db.execute( sql,showResult );
  }
}

function showResultTable(result) {
  document.getElementById("sql").innerHTML = result;
}

function showResult(result) {
  document.getElementById("sql").innerHTML = result;
}
