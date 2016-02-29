    OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
	OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
    OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
    OpenForum.includeScript("/OpenForum/Editor/Editors/CSSEditor/editor.js");
    OpenForum.includeScript("/OpenForum/Javascript/JavaWrapper/File/File.js");

var editor = null;
var editorList = [ {changed: ""} ];
var editingPageName = "/TheLab/CSSEditor";
var editingFileName = "editing.css";
var autoSave = true;

OpenForum.init = function() {
  document.getElementById("cssEditor").innerHTML = OpenForum.loadFile("/OpenForum/Editor/Editors/CSSEditor/standalone.page.html");
  OpenForum.crawl(document.getElementById("cssEditor"));
  
  if(OpenForum.getParameter("pageName")) {
    editingPageName = OpenForum.getParameter("pageName");
    editingFileName = "page.content";
    autoSave = false;
  }
  
  document.title = "Editing "+editingPageName+"/"+editingFileName;
  
  editor = new CssEditor(0,editingPageName,editingFileName);
  editor._init = editor.init;
  editor.init = function() {
    editor._init();

    var localChanges = localStorage.getItem( editingPageName+"/"+editingFileName );
    if( localChanges && localChanges.length>0 ) {
      editor.getCodeMirror().setValue( localStorage.getItem( editingPageName+"/"+editingFileName ) );
    }

    editor.getCodeMirror().on("change", function(cm, change) {
      storeChanges();
    });

    setInterval(autoSaveChanges,10000);
  };
};

function storeChanges() {
  localStorage.setItem( pageName+"/"+editingFileName,editor.getValue() );
}

function autoSaveChanges() {
  if(editorList[0].changed!=="*" || autoSave===false) {
    return;
  }
  save();
}

function save() {
  OpenForum.saveFile(editingPageName+"/"+editingFileName,editor.getValue());
  editorList[0].changed="";
  localStorage.setItem( editingPageName+"/"+editingFileName,"");
      showStatus("All changes saved.");
}

function upload() {
  OpenForum.Browser.upload( function(data) {editor.getCodeMirror().setValue(data); } ,showError);
}

function download() {
  OpenForum.Browser.download(editingFileName,editor.getValue());
}

var statusClearer = null;
var status = " ";

function showStatus(message) {
  if(statusClearer!==null) {
    clearTimeout(statusClearer);
  }
  status = message;
 //$('#status').foundation('reveal', 'open');
  statusClearer = setTimeout( function() { showStatus(" "); },4000);
}

function showError(message) {
  showStatus("Error: "+message);
}