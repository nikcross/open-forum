

var editorIndex = 0;
var editorList = [];
var currentEditor = {name: "Loading...", changed:" "};

function openPageEditor() {
  document.getElementById("newTab").href="/OpenForum/Editor?pageName=" + openPageEditorPageName;
  document.getElementById("newTab").click();
}

function findEditor(editorName) {
  for(var ei in editorList) {
    if(editorList[ei].name===editorName) {
      return editorList[ei];
    }
  }
  return;
}

function addEditor(pageName,fileName,flavour) { 
  editorIndex++;
  var editor = document.createElement("div");
  editor.setAttribute("id","editor"+editorIndex);
  editor.setAttribute("style","display:block;");
  document.getElementById("editors").appendChild(editor);

  var editorObj = null;
  if(flavour=="javascript") {
      editorObj = new JavascriptEditor(editorIndex,pageName,fileName);
  } else if(flavour=="css") {
      editorObj = new CssEditor(editorIndex,pageName,fileName);
  } else if(flavour=="xml") {
      editorObj = new XmlEditor(editorIndex,pageName,fileName);
  }else if(flavour=="html") {
      editorObj = new HtmlEditor(editorIndex,pageName,fileName);
  } else {
    editorObj = new DefaultEditor(editorIndex,pageName,fileName);
  }

  OpenForum.addTab("editor"+editorIndex);
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
  editorList[editorIndex] = {id: editorIndex, tabId: "editor"+editorIndex, editor: editorObj, pageName: pageName, fileName: fileName, name: name, title: pageName+"/"+fileName, flavour: flavour, changed: " "};
  return editorList[editorIndex];
}