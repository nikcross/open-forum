var status = "Loading...";
var editorIndex = 0;
var targetName = "";
var pageName = "/Sandbox";
var fileName = "";
var flavour = "wiki page";
var attachments = [];
var editorList = [];
var plugins = [];
var tabsTree = [];
var newPage = false;

OpenForum.init = function () {
  DependencyService.createNewDependency()
  .addDependency("/OpenForum/Javascript/JavaWrapper/File/File.js")
  
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/search/search.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/search/searchcursor.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/dialog/dialog.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/display/fullscreen.js")
  .addDependency("/OpenForum/Javascript/CodeMirror/addon/selection/active-line.js")
  
  .addDependency("/OpenForum/Editor/Editors/JavascriptEditor/editor.js")
  .addDependency("/OpenForum/Editor/Editors/HTMLEditor/editor.js")
  .addDependency("/OpenForum/Editor/Editors/DefaultEditor/editor.js")
  .addDependency("/OpenForum/Editor/Editors/CSSEditor/editor.js")
  .addDependency("/OpenForum/Editor/Editors/XMLEditor/editor.js")
  
    .setOnLoadTrigger( ready ).loadDependencies();
};

function ready() {
  if(OpenForum.getParameter("pageName")!=="") {
     if(OpenForum.file.pageExists(pageName)==="true") {
        newPage = true;
     }
    pageName = OpenForum.getParameter("pageName");
    changePageName = pageName;
    openFilePageName = pageName;
    openFileName="page.wiki";
    var name = pageName.substring(pageName.lastIndexOf("/"));
    document.title= name + " (" + pageName + ") " + " Editor";
    
    if(OpenForum.file.attachmentExists(pageName,"get.sjs")==="true" || OpenForum.file.attachmentExists(pageName,"post.sjs")==="true") {
      flavour = "service";
    }
  }
  if(OpenForum.getParameter("fileName")!=="") {
    fileName = OpenForum.getParameter("fileName");
    openFileName = fileName;
    flavour = "file";
    document.title=fileName + " ("+pageName+"/"+fileName+")" + " Editor";
  }

  targetName = pageName;
  openFilePageName = pageName;
  openPageEditorPageName = pageName;
  if(fileName.length>0) {
    targetName = pageName + "/" + fileName;
    openFileName = fileName;
  }
  addOverview();
  initPlugins();
  
  OpenForum.getObject("openFilePageName").addListener( loadUpdatedFilesList );
  
  tabsTree = new Tree("tabsTree","Attachments","");
  tabsTree.getRoot().expand();
  
  OpenForum.scan();
  showStatus("Ready");
  OpenForum.hideElement("splash");
  OpenForum.showElement("content");
}

function openPage() {
  document.getElementById("newTab").href=pageName;
  document.getElementById("newTab").click();
}

function loadUpdatedFilesList() {
  document.getElementById("filesList").innerHTML="Loading...";
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+openFilePageName).onSuccess(updateFilesList).go();
}

function updateFilesList(result) {
  data="";
  for(var index in result.attachments) {
    data+="<option value=\""+result.attachments[index].fileName+"\"/>";
  }
  document.getElementById("filesList").innerHTML=data;
}

function updatePagesList(result) {
  data="";
  for(var index in result.pages) {
    data+="<option value=\""+result.pages[index].pageName+"\"/>";
  }
  document.getElementById("pagesList").innerHTML=data;
}

function addOverview() {
  var editor = document.createElement("div");
  editor.setAttribute("id","editor"+editorIndex);
  editor.setAttribute("style","display:block;");
  document.getElementById("editors").appendChild(editor);

  var content = OpenForum.loadFile("/OpenForum/Editor/OverviewTemplate/page.html.fragment");
  OpenForum.setElement("editor"+editorIndex,content);
  OpenForum.crawl(document.getElementById("editor"+editorIndex));
  
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageName).onSuccess(setAttachments).go();
  
  OpenForum.addTab("editor"+editorIndex);
  editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Overview", changed: ""};
  showTab(editorIndex);
  JSON.get("/OpenForum/Actions/Pages","","returnType=json"+pageName).onSuccess(updatePagesList).go();
  loadUpdatedFilesList() ;
  return editorList[editorIndex];
}

function loadPlugin(pluginName) {
    DependencyService.createNewDependency()
  .addDependency("/OpenForum/Editor/Plugins/"+pluginName+"/plugin.js")
    .setOnLoadTrigger(
      function() {
         initPlugin(plugins[plugins.length-1]);
      }
    ).loadDependencies();
}

function addPlugin( plugin ){
  plugins.push(plugin);
}

function initPlugins() {
  for(var pi in plugins) {
    initPlugin(plugins[pi]);
  }
}

function initPlugin(plugin) {
  plugin.init();
}

function setAttachments(response) {
  attachments = response.attachments;
  for(var ai in attachments) {
    attachments[ai].id = ai;
    attachments[ai].action = "openAttachment";
    attachments[ai].actionName = "Open Editor";
    
    addAttachmentToTree(ai);
  }
  tabsTree.render();
    
  OpenForum.scan(document.body);

  openForFlavour();
}

function addAttachmentToTree(attachmentId) {
  var extension = attachments[attachmentId].fileName;
  extension = extension.substring(extension.lastIndexOf("."));
  var actions = [];
  if(extension === ".link") {
   actions.push( new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ) );
   actions.push( new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ));
   actions.push(  new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" ));
   actions.push( new Action( function(node) { forkAttachment( node.getAttribute("id") ); },"arrow_divide" ) );
  } else {
   actions.push( new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ) );
   actions.push( new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ));
   actions.push(  new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" ));
  }
  
      tabsTree.addChild( attachments[attachmentId].fileName, {
        icon: "brick",
        id: attachmentId,
        actions: actions
      }
    );
  
}

function openFile() {
  var newAttachment = {pageName: openFilePageName, fileName: openFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
  attachments.push(newAttachment);
  openAttachment(newAttachment.id);
}

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

function findAttachment(fileName) {
  for(var ai in attachments) {
    if(attachments[ai].fileName==fileName) {
      return attachments[ai];
    }
  }
  return null;
}

function openForFlavour() {
  if(flavour=="wiki page") {
    openAttachments( [
      "page.wiki",
      "page.content",
      "page.js",
      "notes.txt",
      "tags.txt"
    ]);
    showTab(0);
  } else if(flavour=="service") {
    openAttachments( [
      "page.wiki",
      "page.js",
      "notes.txt",
      "tags.txt",
      "get.sjs",
      "post.sjs"
    ]);
    showTab(0);
  } else if(flavour=="file") {
    openAttachments([fileName]);
  }
}

function openAttachments(fileNames) {
  for(var i in fileNames) {
    var fileName = fileNames[i];
    var attachment = findAttachment(fileName);
    if(attachment!==null) {
      openAttachment(attachment.id);
    } else if( newPage ) {
      newAttachmentName = fileName;
      createAttachment();
    }
  }
}

function openAttachment(attachmentId) {
  var fileName = attachments[attachmentId].fileName;
  var pageName = attachments[attachmentId].pageName;

  var flavour = "text";
  if(fileName.indexOf(".js")==fileName.length-3) {
    flavour = "javascript";
  } else if(fileName.indexOf(".sjs")==fileName.length-4) {
    flavour = "javascript";
  } else if(fileName.indexOf(".json")==fileName.length-5) {
    flavour = "javascript";
  } else if(fileName.indexOf(".css")==fileName.length-4) {
    flavour = "css";
  } else if(fileName.indexOf(".wiki")==fileName.length-5) {
    flavour = "html";
  } else if(fileName.indexOf(".content")==fileName.length-8) {
    flavour = "html";
  } else if(fileName.indexOf(".html")==fileName.length-5) {
    flavour = "html";
  } else if(fileName.indexOf(".html.template")==fileName.length-14) {
    flavour = "html";
  } else if(fileName.indexOf(".html.fragment")==fileName.length-14) {
    flavour = "html";
  } else if(fileName.indexOf(".xml")==fileName.length-4) {
    flavour = "xml";
  }

  var editor = addEditor(pageName,fileName,flavour);
  showTab(editor.id);

  editor.attachment = attachments[attachmentId];
  attachments[attachmentId].action = "saveAttachment";
  attachments[attachmentId].actionName = "Save";
  attachments[attachmentId].editor = editor;
  
  tabsTree.addChild( attachments[attachmentId].fileName, {
      icon: "brick",
      id: attachmentId,
      actions: [
        new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ),
        new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ),
        new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" )
      ]
    }
  );
  
  tabsTree.render();
}

function forkAttachment(attachmentId) {
  var sourceAttachment = attachments[attachmentId];
  //alert("Fork"+sourceAttachment.pageName+" : "+sourceAttachment.fileName);
  var result = JSON.parse( OpenForum.loadFile("/OpenForum/Actions/ForkLink?pageName="+sourceAttachment.pageName+"&fileName="+sourceAttachment.fileName ));
  
 var newAttachment = {pageName: result.pageName, fileName: result.newFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
 attachments.push(newAttachment);
 openAttachment(newAttachment.id);
}

function closeTab(tabId) {
  var editor = editorList[tabId];
  editorList.splice(tabId,1);
  editor.attachment.action = "openAttachment";
  editor.attachment.actionName = "Open Editor";
}

function saveAttachments() {
  showStatus("Saving all changes");
  if(hasChanges()) {
      for(var attachmentIndex in attachments) {
        if(attachments[attachmentIndex].editor && attachments[attachmentIndex].editor.changed=="*") {
          saveAttachment(attachmentIndex);
        }
      }
      showStatus("All changes saved.");
  } else {
    showStatus("No files have been changed.");
  }
}

function hasChanges() {
    var changes = false;
  for(var attachmentIndex in attachments) {
    if(attachments[attachmentIndex].editor && attachments[attachmentIndex].editor.changed=="*") {
      changes = true;
    }
  }
    return changes;
}

window.onbeforeunload = function (e) {
  if(hasChanges()) {
    e = e || window.event;
    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'You have unsaved changes.';
    }

    // For Safari
    return 'You have unsaved changes.';
  }
};

function saveAttachment(attachmentIndex) {
  var fileToSave = attachments[attachmentIndex].pageName + "/" + attachments[attachmentIndex].fileName;
  var data = attachments[attachmentIndex].editor.editor.getValue();
  var result = OpenForum.saveFile(fileToSave,data);
  if(result.saved===true && attachments[attachmentIndex].editor) {
    attachments[attachmentIndex].editor.changed="";
    showStatus("Saved "+fileToSave);
  } else {
    showStatus("Failed to save "+fileToSave+" :"+result);
  }
}

function createAttachment() {
  var ai = attachments.length;
  attachments.push({});
  attachments[ai].id = ai;
  attachments[ai].fileName = newAttachmentName;
  attachments[ai].pageName = pageName;
  attachments[ai].action = "openAttachment";
  attachments[ai].actionName = "Open Editor";

  var fileToSave = pageName + "/" + attachments[ai].fileName;
  var data = "";
  var result = OpenForum.saveFile(fileToSave,data);
  if(result.saved===true) {
    showStatus("Created "+fileToSave);
    openAttachment(ai);
  } else {
    showStatus("Failed to create "+fileToSave+" :"+result);
  }
}

function showTab(editorId) {
  var editor = editorList[editorId];
  OpenForum.showTab("editor"+editorId);
  for(var edId in editorList) {
    editorList[edId].tabButtonStyle="tab";
  }
  editor.tabButtonStyle = "tabSelected";
  if(editor.editor && editor.editor!==null) {
    editor.editor.refresh();
  }
}

function addEditor(pageName,fileName,flavour) { 
  editorIndex++;
  var editor = document.createElement("div");
  editor.setAttribute("id","editor"+editorIndex);
  editor.setAttribute("style","display:none;");
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
  editorList[editorIndex] = {id: editorIndex, tabId: "editor"+editorIndex, editor: editorObj, pageName: pageName, fileName: fileName, name: name, title: pageName+"/"+fileName, flavour: flavour, changed: ""};
  return editorList[editorIndex];
}

function showStatus(message) {
  status = message;
  console.log(message);
}

function copyPage() {
  window.location = "/OpenForum/Actions/Copy?newPageName="+newPageNameCopy+"&sourcePageName="+pageName;
}

function movePage() {
  window.location = "/OpenForum/Actions/Copy?newPageName="+newPageNameMove+"&pageName="+pageName;
}

function zipPage() {
  window.location = "/OpenForum/Actions/Zip?action=zip&pageName="+pageName;
}

function deletePage() {
  window.location = "/OpenForum/Actions/Delete?pageName="+pageName;
}