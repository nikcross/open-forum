    OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
	OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
    OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
    OpenForum.includeScript("/OpenForum/Editor/Editors/HTMLEditor/editor.js");

var editor = null;
var editorList = [ {changed: ""} ];
var editingPageName = "/TheLab/HtmlEditor";
var editingFileName = "editing.html";
var autoSave = true;

OpenForum.init = function() {
  document.getElementById("htmlEditor").innerHTML = OpenForum.loadFile("/OpenForum/Editor/Editors/HTMLEditor/standalone.page.html");
  OpenForum.crawl(document.getElementById("htmlEditor"));
  
  if(OpenForum.getParameter("pageName")) {
    editingPageName = OpenForum.getParameter("pageName");
    editingFileName = "page.content";
    autoSave = false;
  }
  
  document.title = "Editing "+editingPageName+"/"+editingFileName;
  
  editor = new HtmlEditor(0,editingPageName,editingFileName);
  editor._init = editor.init;
  editor.init = function() {
    editor._init();

    var localNotes = localStorage.getItem( editingPageName+"/"+editingFileName );
    if( localNotes && localNotes.length>0 ) {
      editor.getCodeMirror().setValue( localStorage.getItem( editingPageName+"/"+editingFileName ) );
    }

    editor.getCodeMirror().on("change", function(cm, change) {
      storeNotes();
    });

    setInterval(autoSaveNotes,10000);
  };
};

function storeNotes() {
  localStorage.setItem( pageName+"/"+editingFileName,editor.getValue() );
}

function autoSaveNotes() {
  if(editorList[0].changed!=="*" || autoSave===false) {
    return;
  }
  saveNotes();
}

function saveNotes() {
  OpenForum.saveFile(editingPageName+"/"+editingFileName,editor.getValue());
  editorList[0].changed="";
  localStorage.setItem( editingPageName+"/"+editingFileName,"");
      showStatus("All changes saved.");
}

function showStatus(message) {
  status = message;
  $('#statusModal').foundation('reveal', 'open');
}