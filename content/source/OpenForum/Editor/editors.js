//Author: Nik Cross

var editorIndex = 0;
var editorList = [];
var currentEditor = {name: "Loading...", changed:" "};

function openPageEditor() {
  document.getElementById("newTab").href="/OpenForum/Editor?pageName=" + openPageEditorPageName;
  document.getElementById("newTab").click();
}

function findEditorById(editorId) {
  for(var ei in editorList) {
    if(editorList[ei].id==editorId) {
      return editorList[ei];
    }
  }
  return;
}

function findEditor(editorName) {
  for(var ei in editorList) {
    if(editorList[ei].name==editorName) {
      return editorList[ei];
    }
  }
  return;
}

function closeEditor(editorId) {
  var editor = findEditorById(editorId);

  var doc = document.getElementById(editor.tabId);
  doc.parentNode.removeChild(doc);
  var tab = document.getElementById("editor-tab-"+editor.id);
  tab.parentNode.removeChild(tab);

  if(editor.attachment) {
    var attachmentId = editor.attachment.id;
    attachments[attachmentId].action = "openAttachment";
    attachments[attachmentId].actionName = "Edit";
    attachments[attachmentId].actionIcon = "page_edit";
    attachments[attachmentId].icon = "tag_blue";
    attachments[attachmentId].editor = null;
  }
  if(editor.plugin && editor.plugin.close) {
    editor.plugin.close();
  }
  
  for(var ei in editorList) {
    if(editorList[ei]===editor) {
      editorList.splice(ei,1);
      break;
    }
  }
  
  showTab(0);
}

function displayContentTab(newPageName,fileName,title) {
  var editor = addEditor(newPageName,fileName,"content",title);
  showTab( editor.id );
}

function addEditor(newPageName,fileName,flavour,tabName) { 
  
  if(!fileName) {
    fileName = newPageName.substring( newPageName.lastIndexOf("/")+1 );
    newPageName = newPageName.substring( 0, newPageName.lastIndexOf("/") );
  }
  
  if(!flavour) {
    flavour = getFlavour( fileName );
  }
  
  editorIndex++;
  var tabId = "editor"+editorIndex;
  var editorDiv = document.createElement("div");
  editorDiv.setAttribute("id",tabId);
  editorDiv.setAttribute("style","display:block;");
  document.getElementById("editors").appendChild(editorDiv);

  var isScrap = fileName.startsWith("scrap.");
  var editorObj = null;
  if(flavour=="javascript") {
    editorObj = new JavascriptEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="css") {
    editorObj = new CSSEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="xml") {
    editorObj = new XMLEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="html") {
    editorObj = new HTMLEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="sql") {
    editorObj = new SQLEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="python") {
    editorObj = new PythonEditor(editorIndex,newPageName,fileName,!isScrap);
  } else if(flavour=="content") {
    editorObj = new ContentView(editorIndex,newPageName,fileName,!isScrap);
  } else {
    editorObj = new DefaultEditor(editorIndex,newPageName,fileName,!isScrap);
  }

  var newName = fileName;
  if( isUndefined(tabName) == false ) {
    newName = tabName;
  } else if(newPageName != pageName) {
    newName = newPageName + "/" + fileName;
  }
  
  OpenForum.addTab(tabId);
  var fileCount = 0;
  for(var e in editorList) {
    if(editorList[e].name === newName) {
      fileCount++;
    }
  }
  
  if(fileCount>0) {
    newName = newName + "[" + fileCount + "]";
  }

  var options = "";
  if(editorObj.renderOptions) {
    options = editorObj.renderOptions();
  }

  var editor = {id: editorIndex, tabId: tabId, editor: editorObj, pageName: newPageName, fileName: fileName, name: newName, title: pageName+"/"+fileName, flavour: flavour, changed: " ", options: options };
  editorList.push( editor );

  return editor;
}