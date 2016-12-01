OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/merge/merge.css");
OpenForum.loadScript("https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js"); 

OpenForum.includeScript("/OpenForum/Editor/attachments.js");
OpenForum.includeScript("/OpenForum/Editor/editors.js");
OpenForum.includeScript("/OpenForum/Editor/plugins.js");
OpenForum.includeScript("/OpenForum/Editor/tabs.js");
OpenForum.includeScript("/OpenForum/Editor/drag-and-drop.js");
OpenForum.includeScript("/OpenForum/Editor/search.js");

OpenForum.includeScript("/OpenForum/Javascript/JavaWrapper/File/File.js");

OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
//OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/search/search.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/search/searchcursor.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/display/fullscreen.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/selection/active-line.js");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/addon/selection/mark-selection.js");

OpenForum.includeScript("/OpenForum/Editor/Editors/JavascriptEditor/editor.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/HTMLEditor/editor.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/DefaultEditor/editor.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/CSSEditor/editor.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/XMLEditor/editor.js");

var popupStatus = "ok";
var status = "Loading...";
var targetName = "";
var pageName = "/Sandbox";
var shortPageName = pageName;
var pageSize = "?";
var pageLastModified = "?";
var fileName = "";
var parentPage = " ";
var parentPageLink = " ";
var flavour = "page";
var newPage = false;

var uploadURL = "http://";
var uploadURLFileName = " ";

var tree;
var data = {};
var dataView = "Loading...";

var builderPath = "Loading...";
var templatePath = "Loading...";
var accessPath = "Loading...";
var accessView = "Loading...";

var documentation = [
  //{pageName: "/OpenForumDocumentation/Editor", title: "The Editor"},
  //{pageName: "/OpenForumDocumentation/EditorKeys", title: "Editor Keys"}
];

var extraActions = [
  {fn: "openPage", name: "View Page", description: "View Current Page in a New Tab", icon: "eye"},
  {fn: "openLivePage", name: "Open Live Page", description: "View Current Page Live in a New Tab", icon: "lightning"},
  {fn: "saveAttachments", name: "Save All", description: "Save All Changes to Page", icon: "disk_multiple"}
];


OpenForum.init = function () {
  if(OpenForum.getParameter("pageName")==="") {
    pageName = "/Sandbox";
    shortPageName = pageName;
  } else if(OpenForum.getParameter("pageName")==="/") {
    pageName = "/OpenForum/HomePage";
  } else {
    pageName = OpenForum.getParameter("pageName");
    shortPageName = pageName;
    if(shortPageName.length>20) {
      shortPageName="..."+shortPageName.substring(shortPageName.length-17);
    }
  }
  document.getElementById("pageTitle").title="Editing "+pageName;

  if(OpenForum.file.pageExists(pageName)==="false") {
    newPage = true;
  }
  var name = pageName.substring(pageName.lastIndexOf("/"));
  document.title= name + " (" + pageName + ") " + " Editor";

  if(OpenForum.file.attachmentExists(pageName,"get.sjs")==="true") {
    flavour = "get service";
  }

  if(OpenForum.file.attachmentExists(pageName,"post.sjs")==="true") {
    flavour = "post service";
  }

  if(OpenForum.file.attachmentExists(pageName,"get.sjs")==="true" && OpenForum.file.attachmentExists(pageName,"post.sjs")==="true") {
    flavour = "mixed service";
  }

  //File Edit
  if(OpenForum.getParameter("fileName")!=="") {
    fileName = OpenForum.getParameter("fileName");
    flavour = "file";
    document.title=fileName + " ("+pageName+"/"+fileName+")" + " Editor";
  }
  addOverview();
  //loadUpdatedFilesList();
  initPlugins();

  OpenForum.scan();

  $(document).foundation('reflow');

  if(OpenForum.fileExists(pageName+"/data.json")) {
    dataView = OpenForum.loadFile( pageName+"/data.json" );
    data = JSON.parse( dataView );

    if(data.pageParent) {
      extraActions.push( {fn: "publishPage", name: "Publish", description: "Publish page", icon: "page"} );
    }
  } else {
    dataView = "No data.json present";
  }

  if(OpenForum.fileExists(pageName+"/access.json")) {
    accessView = OpenForum.loadFile( pageName+"/access.json" );
  } else {
    accessView = "No access.json present";
  }

  new Process().waitFor( function() { return attachmentsReady; }).then(openForFlavour).run();

  builderPath = OpenForum.file.getPageInheritedFilePath(pageName,"page.build.js");
  templatePath = OpenForum.file.getPageInheritedFilePath(pageName,"page.html.template");
  accessPath = OpenForum.file.getPageInheritedFilePath(pageName,"access.json");

  setKeyMappings();

  setTimeout(checkForChanges,5000);
};

var lastCheckTime = new Date().getTime();
function checkForChanges() {
  JSON.get("/OpenForum/Editor","getUpdates","pageName="+pageName+"&lastCheckTime="+lastCheckTime).onSuccess( processChanges ).go();
  JSON.get("/OpenForum/Actions/User","getCurrentUser").onSuccess( checkUser ).go();
}

function checkUser(response) {
  if(response!=currentUser) {
    currentUser = response;
    if(response=="Guest") {
      showPopup("You have been logged out.\nYou may not be able to save any changes you have made.\nPlease log back in.");
      return;
    } else {
      showStatus("You have been logged in as a different user.");
    }
  }
}

function processChanges(response) {

  lastCheckTime = new Date().getTime();

  if(response.user!=currentUser) {
    currentUser = response.user;
    if(response.user=="Guest") {
      showPopup("You have been logged out.\nYou may not be able to save any changes you have made.\nPlease log back in.");
      return;
    } else {
      showStatus("You have been logged in as a different user.");
    }
  }

  for(var i=0;i<response.changedFiles.length;i++) {
    var changedFile = response.changedFiles[i];
    var editor = findAttachmentEditor(changedFile.pageName,changedFile.fileName);
    if(editor) {

      var newData = OpenForum.loadFile(changedFile.pageName+"/"+changedFile.fileName);
      if(newData==editor.editor.getValue()) {
        continue;
      }
      if(editor.changed==" ") {
        editor.editor.setValue( newData );
        editor.changed=" ";
        showPopup( "The file "+changedFile.fileName+" you have open has been changed on the server.\nThe source in the editor has been updated." );
      } else {
        showPopup( "The file "+changedFile.fileName+" you have made chnages to has been changed on the server.\nThe source in the editor has NOT been updated." );
      }
    } else {
      showStatus( "The file "+changedFile.fileName+" has been changed on the server." );

    }
  }

  setTimeout(checkForChanges,5000);
}

function setKeyMappings() {
  $(document).bind('keydown', function(e) {
    if(e.ctrlKey && !e.shiftKey && (e.which == 83)) {
      e.preventDefault();
      if(currentEditor.attachment) {
      	saveAttachment(currentEditor.attachment.id);
      }
      return false;
    }
  });

  $(document).bind('keydown', function(e) {
    if(e.ctrlKey && e.shiftKey && (e.which == 83)) {
      e.preventDefault();
      saveAttachments();
      return false;
    }
  });

  $(document).bind('keydown', function(e) {
    if(e.ctrlKey && e.shiftKey && (e.which == 70)) {
      e.preventDefault();
      return false;
    }
  });

}

function openPage() {
  /*document.getElementById("newTab").href=pageName;
  document.getElementById("newTab").click();*/
  window.open(pageName);
}

function openLivePage() {
  window.open("/OpenForum/Editor/LivePageView?pageName="+pageName);
}

function updatePagesList(result) {
  var editIcon = "<img src=\"/OpenForum/Images/icons/png/page_edit.png\"/>";

  dropDownData="";
  data="<ul>\n";
  for(var i=0; i<result.length ;i++) {
    var url = result[i];
    var shortName = url.substring(url.lastIndexOf("/")+1);

    var link = "<a href=\"/OpenForum/Editor?pageName="+url+"\" title=\"Open new editor for page "+shortName+"\">"+shortName+" "+editIcon+"</a>";

    data+="<li><span ondrop=\"drop(event,'"+result[i]+"')\" ondragover=\"allowDrop(event)\" title=\"You can drop files on me\"><img src=\"/OpenForum/Images/icons/png/page.png\"></span> "+link+"</li>\n";
    dropDownData+="<li>"+link+"</li>\n";
  }
  data+="</ul>\n";

  document.getElementById("subPageDropdown").innerHTML=dropDownData;
  document.getElementById("subPagesList").innerHTML=data;

  if( pageName.lastIndexOf("/")!==0 ) {
    parentPage = pageName.substring(0,pageName.lastIndexOf("/"));
    parentPageLink ="<a href=\""+parentPage+"\">"+parentPage+"</a><a href=\"/OpenForum/Editor?pageName="+parentPage+"\">"+editIcon+"</a>";
  } else {
    parentPage = "";
    parentPageLink = "";
  }
}

function addOverview() {
  var editor = document.createElement("div");
  editor.setAttribute("id","editor"+editorIndex);

  document.getElementById("editors").appendChild(editor);

  var content = OpenForum.loadFile("/OpenForum/Editor/OverviewTemplate/page.html.fragment");
  OpenForum.setElement("editor"+editorIndex,content);
  OpenForum.crawl(document.getElementById("editor"+editorIndex));
  
  updateOverview();
}

function updateOverview() {
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageName+"&metaData=true").onSuccess(setAttachments).go();

  var options = "<li><a href=\"#\" data-reveal-id=\"OpenForumDocumentationModal\" onClick=\"OpenForum.showDocumentation('Editor/Overview'); return false;\" title=\"Quick information on the Overview panel.\">Quick Info</a></li>";

  OpenForum.addTab("editor"+editorIndex);
  editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Overview", changed: "", options: options};
  showTab(editorIndex);
  JSON.get("/OpenForum/Actions/Pages","","pageName="+pageName).onSuccess(updatePagesList).go();

  tree = OpenForum.createFileTree("explorer","/");
  tree.init = function() {  tree.expandPath(pageName); };

  currentEditor = editorList[editorIndex];
  return editorList[editorIndex];
}

function renderTabOption(name,toolTip,action) {
  return "<li><a href=\"#\" onClick=\""+action+"; return false;\" title=\""+toolTip+"\">"+name+"</a></li>";
}

function openForFlavour() {
  if(flavour=="page") {
    openAttachments( [
      "page.js",
      "page.content"
    ]);
  } else if(flavour=="get service") {
    openAttachments( [
      "page.js",
      "get.sjs",
      "page.content"
    ]);
  } else if(flavour=="post service") {
    openAttachments( [
      "page.js",
      "post.sjs",
      "page.content"
    ]);
  } else if(flavour=="mixed service") {
    openAttachments( [
      "page.js",
      "get.sjs",
      "post.sjs",
      "page.content"
    ]);
  } else if(flavour=="file") {
    openAttachments([fileName]);
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

function uploadFromURL() {
  JSON.get("/OpenForum/Actions/Attach","upload","pageName="+pageName+"&fileName="+uploadURLFileName+"&url="+uploadURL)
    .onSuccess( 
    function() {
      showStatus("Transfered "+uploadURL+" to "+uploadURLFileName);
    })
    .onError( 
    function() {
      showStatus("Failed to transfer "+uploadUrl);
    }
  ).go();
}

var statusTimeout;
function showStatus(message) {
  status = message.replaceAll("\n","<br/>");
  if(statusTimeout) {
    clearTimeout(statusTimeout);
  }
  if(message!=="ready") {
    statusTimeout = setTimeout(function(){ showStatus("ready");},5000);
  }
}

function showPopup(message) {
  popupStatus = message.replaceAll("\n","<br/>");
  $('#statusModal').foundation('reveal', 'open');
}

function publishPage() {
  OpenForum.file.zipPage(pageName,publishZippedPage);
}

function publishZippedPage(response) {
  var publishingTicket = "pt-"+Math.random()+new Date().getTime();
  var zipFileName = pageName.substring(pageName.lastIndexOf("/"));

  OpenForum.file.copyAttachment(pageName,zipFileName+".wiki.zip",pageName,zipFileName+".wiki.zip."+publishingTicket,function(){ publishTicket(publishingTicket); });
}

function publishTicket(publishingTicket) {
  JSON.get(data.pageParent+"/OpenForum/PublishingJournal","published","ticket="+publishingTicket+"&page="+pageName+"&host="+window.location.hostname+"&port="+window.location.port).go();
  showStatus("Page "+pageName+" published to "+data.pageParent+". Ticket:"+publishingTicket);
}
