var status = "Loading...";
var targetName = "";
var pageName = "/Sandbox";
var fileName = "";
var flavour = "page";
var newPage = false;
var data = {};
var dataView = "";

var documentation = [
  //{pageName: "/OpenForumDocumentation/Editor", title: "The Editor"},
  //{pageName: "/OpenForumDocumentation/EditorKeys", title: "Editor Keys"}
];

var extraActions = [
  {fn: "openPage", name: "View Page", description: "View Current Page in a New Tab", icon: "eye"},
  {fn: "saveAttachments", name: "Save All", description: "Save All Changes to Page", icon: "disk_multiple"}
];


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
  //Possibly page edit
  if(OpenForum.getParameter("pageName")!=="") {
    if(OpenForum.file.pageExists(pageName)==="true") {
      newPage = true;
    }
    pageName = OpenForum.getParameter("pageName");
    var name = pageName.substring(pageName.lastIndexOf("/"));
    document.title= name + " (" + pageName + ") " + " Editor";

    if(OpenForum.file.attachmentExists(pageName,"get.sjs")==="true" || OpenForum.file.attachmentExists(pageName,"post.sjs")==="true") {
      flavour = "service";
    }
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
  }
  
  //new Process().waitFor( function() { return attachmentsReady; }).then(openForFlavour);
}

function openPage() {
  document.getElementById("newTab").href=pageName;
  document.getElementById("newTab").click();
}

function updatePagesList(result) {
  dropDownData="";
  data="<ul>\n";
  for(var i=0; i<result.length ;i++) {
    data+="<li><a href=\"/OpenForum/Editor?pageName="+result[i]+"\">"+result[i]+"</a></li>\n";
    dropDownData+="<li><a href=\"/OpenForum/Editor?pageName="+result[i]+"\">"+result[i]+"</a></li>\n";
  }
  data+="</ul>\n";
  
  document.getElementById("subPageDropdown").innerHTML=dropDownData;
  document.getElementById("subPagesList").innerHTML=data;
}

function addOverview() {
  var editor = document.createElement("div");
  editor.setAttribute("id","editor"+editorIndex);
  //editor.setAttribute("style","display:block;");
  document.getElementById("editors").appendChild(editor);

  var content = OpenForum.loadFile("/OpenForum/Editor/OverviewTemplate/page.html.fragment");
  OpenForum.setElement("editor"+editorIndex,content);
  OpenForum.crawl(document.getElementById("editor"+editorIndex));

  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageName).onSuccess(setAttachments).go();

  OpenForum.addTab("editor"+editorIndex);
  editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Overview", changed: ""};
  showTab(editorIndex);
  JSON.get("/OpenForum/Actions/Pages","","pageName="+pageName).onSuccess(updatePagesList).go();
  //  loadUpdatedFilesList() ;

  currentEditor = editorList[editorIndex];
  return editorList[editorIndex];
}

function openForFlavour() {
  alert(flavour);
  if(flavour=="page") {
    openAttachments( [
      "page.content",
      "page.js"
    ]);
    showTab(0);
  } else if(flavour=="service") {
    openAttachments( [
      "page.content",
      "page.js",
      "get.sjs",
      "post.sjs"
    ]);
    showTab(0);
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

function showStatus(message) {
  status = message;
  document.getElementById("displayStatusModal").click();
  //  console.log(message);
}

OpenForum.Actions = {};
OpenForum.Actions.copyPage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&sourcePageName="+pageName);
};

OpenForum.Actions.movePage = function(pageName,newPageName) {
  OpenForum.loadFile("/OpenForum/Actions/Copy?newPageName="+newPageName+"&pageName="+pageName);
};

OpenForum.Actions.zipPage = function(pageName) {
  OpenForum.loadFile("/OpenForum/Actions/Zip?action=zip&pageName="+pageName);
};

OpenForum.Actions.deletePage = function(pageName) {
  OpenForum.loadFile(window.location = "/OpenForum/Actions/Delete?pageName="+pageName);
};


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


function Process() {
  var callFn;
  var waitTest;
  var thenFn;

  var self = this;

  self.call = function(newCallFn) {
    callFn = newCallFn;
    return self;
  };

  self.waitFor = function(newWaitTest) {
    waitTest = newWaitTest;
    return self;
  };

  self.then = function(newThenFn) {
    thenFn = newThenFn;
    return self;
  };

  var wait = function() {
    if(waitTest()===false) {
      setTimeout(wait,100);
    } else {
      if(thenFn) thenFn();
    }
  };
  
  self.run = function(data) {
    if(callFn) callFn(data);
    wait();
  };
}
