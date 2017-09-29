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

/*
function findEditorIndex(editorName) {
  for(var ei in editorList) {
    if(editorList[ei].name===editorName) {
      return ei;
    }
  }
  return -1;
}
*/

function closeEditor(editorId) {
  var editor = findEditorById(editorId);

  var doc = document.getElementById(editor.tabId);
  doc.parentNode.removeChild(doc);
  var tab = document.getElementById("editor-tab-"+editor.id);
  tab.parentNode.removeChild(tab);

  var attachmentId = editor.attachment.id;
  attachments[attachmentId].action = "openAttachment";
  attachments[attachmentId].actionName = "Edit";
  attachments[attachmentId].actionIcon = "page_edit";
  attachments[attachmentId].icon = "tag_blue";
  attachments[attachmentId].editor = null;
  
  for(var ei in editorList) {
    if(editorList[ei]===editor) {
      editorList.splice(ei,1);
      break;
    }
  }
  
  showTab(0);
}

function addEditor(pageName,fileName,flavour) { 
  editorIndex++;
  var tabId = "editor"+editorIndex;
  var editorDiv = document.createElement("div");
  editorDiv.setAttribute("id",tabId);
  editorDiv.setAttribute("style","display:block;");
  document.getElementById("editors").appendChild(editorDiv);

  var isScrap = fileName.startsWith("scrap.");
  var editorObj = null;
  if(flavour=="javascript") {
    editorObj = new JavascriptEditor(editorIndex,pageName,fileName,isScrap);
  } else if(flavour=="css") {
    editorObj = new CSSEditor(editorIndex,pageName,fileName);
  } else if(flavour=="xml") {
    editorObj = new XMLEditor(editorIndex,pageName,fileName);
  }else if(flavour=="html") {
    editorObj = new HTMLEditor(editorIndex,pageName,fileName);
  } else {
    editorObj = new DefaultEditor(editorIndex,pageName,fileName);
  }

  OpenForum.addTab(tabId);
  var fileCount = 0;
  for(var e in editorList) {
    if(editorList[e].name === fileName) {
      fileCount++;
    }
  }
  var name = fileName;
  if(fileCount>0) {
    name = fileName + "[" + fileCount + "]";
  }

  var options = "";
  if(editorObj.renderOptions) {
    options = editorObj.renderOptions();
  }

  var editor = {id: editorIndex, tabId: tabId, editor: editorObj, pageName: pageName, fileName: fileName, name: name, title: pageName+"/"+fileName, flavour: flavour, changed: " ", options: options };
  editorList.push( editor );

  return editor;
}