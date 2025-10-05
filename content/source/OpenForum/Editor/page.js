OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.loadCSS("/OpenForum/Editor/editor.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/merge/merge.css");
OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/dialog/dialog.css");
OpenForum.loadScript("https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js"); 

OpenForum.includeScript("/OpenForum/Editor/open-forum-editor.js");

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
//var overviewTree;
var pageDetails = {
  errors: "",
  data: "",
  userAccess: [],
  groupAccess: [],
  builderPath: "Loading...",
  templatePath: "Loading...",
  accessPath: "Loading...",
  accessPathEditLink: "/OpenForum/Authorization/AccessAdministration",
  accessPathPageEditLink: "/OpenForum/Authorization/AccessAdministration",
  accessView: "Loading...",
  extras: ""
};

var data = {};
var dataView = "Loading...";

//var builderPath = "Loading...";
//var templatePath = "Loading...";
//var accessPath = "Loading...";
//var accessView = "Loading...";

var editorConfigFile = "editor-config.json";
var editorConfig = null;

var documentation = [
  //{pageName: "/OpenForumDocumentation/Editor", title: "The Editor"},
  //{pageName: "/OpenForumDocumentation/EditorKeys", title: "Editor Keys"}new Date().getTime()
];

var extraActions = [
  {fn: "openPage", name: "View Page", description: "View Current Page in a New Tab", icon: "/OpenForum/Images/icons/png/eye.png"},
  {fn: "openLivePage", name: "Open Live Page", description: "View Current Page Live in a New Tab", icon: "/OpenForum/Images/icons/png/lightning.png"},
  {fn: "saveAttachments", name: "Save All", description: "Save All Changes to Page", icon: "/OpenForum/Images/icons/png/disk_multiple.png"},
  {fn: "addNote", name: "Add Note", description: "Add Note to Page", icon: "/OpenForum/Images/icons/png/pencil.png"},
  {fn: "editReference", name: "Edit Quick Reference", description: "Create or Edit Quick Reference for this page", icon: "/OpenForum/Images/icons/png/pencil.png"},
  {fn: "convertToContentEditor", name: "Convert To Content Editor", description: "Convert the page into a WYSIWYG content editor page", icon: "/OpenForum/Images/icons/png/page_white_edit.png"},
  {fn: "saveEditorConfig", name: "Save Editor Configuration", description: "Save Current Editor Configuration", icon: "/OpenForum/Images/icons/png/disk.png"},
  {fn: "showQRCode", name: "Show QRCode", description: "Show QR code for link to page", icon: "/OpenForum/Images/icons/png/link.png"}
];

var availablePlugins = [
  {sourcePage: "Console", name: "Javascript Console", icon: "computer_go"},
  {sourcePage: "ServerConsole", name: "Server Side Javascript Console", icon: "server_go"},
  {sourcePage: "PagePreview", name: "Page Preview", icon: "eye"},
  {sourcePage: "/OpenForum/AddOn/DataTransformer/plugin.js", name: "Data Transform Helper", icon: "page_white_wrench"},
  {sourcePage: "FormBuilder", name: "Simple Form Builder", icon: "script_go"},
  {sourcePage: "TableBuilder", name: "Simple Table Builder", icon: "application_view_columns"},
  {sourcePage: "FileDiff", name: "Difference View", icon: "disk_multiple"},
  {sourcePage: "/OpenForum/AddOn/ServiceBuilder/service-builder-plugin.js", name: "Web Service Builder", icon: "server_edit"},
  {sourcePage: "/OpenForum/AddOn/ServiceBuilder/javascript-builder-plugin.js", name: "Javascript Builder", icon: "computer_edit"},
  {sourcePage: "/OpenForum/AddOn/ServiceBuilder/PluginBuilder/plugin.js", name: "Plugin Builder", icon: "plugin_go"},
  {sourcePage: "/OpenForum/AddOn/ServiceBuilder/ExtensionBuilderClient/plugin.js", name: "Extension Builder", icon: "disconnect"},
  {sourcePage: "/OpenForum/AddOn/SQL/SQLPlugin/plugin.js", name: "SQL Plugin", icon: "database_go"},
  {sourcePage: "History", name: "Page History", icon: "clock"}
];

var pageFileOptions = [
  {title: "Get Service", file: "get.sjs"},
  {title: "Post Service", file: "post.sjs"},
  {title: "Get Service Definition", file: "get-service-definition-config.json"},
  {title: "Post Service Definition", file: "post-service-definition-config.json"},
  {title: "Javascript Builder Definition", file: "script.build.json"}
];

OpenForum.init = function () {
  try {

    if(OpenForum.getParameter("pageName")==="") {
      pageName = "/Sandbox";
      shortPageName = "Sandbox";
    } else if(OpenForum.getParameter("pageName")==="/") {
      pageName = "/OpenForum/HomePage";
      shortPageName = "Home Page";
    } else {
      pageName = OpenForum.getParameter("pageName");
      if( pageName.substring(0,2) == "//" ) pageName = pageName.substring(1);
      if(pageName.indexOf("?")!=-1) {
        pageName = pageName.substring(0,pageName.indexOf("?"));
      }

      var testName = pageName.substring( pageName.lastIndexOf("/")+1 );
      if( testName.indexOf(".") != -1 ) {
        pageName = pageName.substring( 0,pageName.lastIndexOf("/") );
        fileName = testName;

        flavour = "file";
        document.title=fileName + " ("+pageName+"/"+fileName+")" + " Editor";
      }

      shortPageName = pageName.substring(pageName.lastIndexOf("/")+1);
      if(shortPageName.length>20) {
        shortPageName="..."+shortPageName.substring(shortPageName.length-17);
      }

      document.title = shortPageName + " - Editor";
    }
    if(OpenForum.getParameter("config")!="") {
      editorConfigFile = OpenForum.getParameter("config");
      editorConfig = OpenForum.loadJSON(editorConfigFile,null,true);
    }

    //Check for Development version
    OpenForum.runAsync(
      function() {
        if( OpenForum.fileExists( "/Development" + pageName + "/page.content" ) ) {
          if( confirm( "A version of this page exists in Development. Would you like to switch to it ?" ) ) {
            window.location = "/Development" + pageName + "?edit";
          }
        }
      }
    );

    if(editorConfig == null) {
      document.getElementById("pageTitle").title="Editing "+pageName;

      if(OpenForum.file.pageExists(pageName)==="false") {
        newPage = true;
      }

      shortPageName = pageName.substring(pageName.lastIndexOf("/")+1);
      if(shortPageName.length>20) {
        shortPageName="..."+shortPageName.substring(shortPageName.length-17);
      }

      document.title = shortPageName + " - Editor";

      if(OpenForum.file.attachmentExists(pageName,"renderer.sjs")==="true") {
        flavour = "markup extension";
      }

      if(OpenForum.file.attachmentExists(pageName,"trigger.sjs")==="true") {
        flavour = "trigger";
      }

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
    } else {
      flavour = "configured";
    }

    addOverview();
    //loadUpdatedFilesList();
    initAvailablePlugins();
    initPlugins(); //Not sure this is doing anything

    if(editorConfig != null) {
      openEditorConfig();
    }

    OpenForum.scan();

    if(OpenForum.fileExists(pageName+"/data.json")) {
      try{
        data = OpenForum.loadJSON( pageName+"/data.json?ts=" + new Date().getTime() );

        for(var i in data) {
          //overviewTree.pageDetails.metaData.addChild( i + " = " + data[i],{icon: "tag_purple"} );
          pageDetails.data += i + " = " + data[i] + "<br/>";
        }

        if(data.pageParent) {
          extraActions.push( {fn: "releasePage", name: "Release", description: "Release page", icon: "/OpenForum/Images/icons/png/page.png"} );

          if( data.pageParent.indexOf("/Development" == 0) ){
            extraActions.push( {fn: "publish", name: "Publish Page", description: "Publish page", icon: "/OpenForum/Images/icons/png/page_go.png"} );
          }
        }

        if(
          typeof data.pageName == "undefined" ||
          typeof data.title == "undefined"
        ) {
          extraActions.push( {fn: "rebuildPageData", name: "Rebuild data.json", description: "Rebuild the page data.json file", icon: "/OpenForum/Images/icons/png/wrench.png"} );
          alert("Data.json is missing data. Use the Rebuild data.json Action fix this.");
        } else if(
          data.pageName != pageName
        ) {
          extraActions.push( {fn: "rebuildPageData", name: "Rebuild data.json", description: "Rebuild the page data.json file", icon: "/OpenForum/Images/icons/png/wrench.png"} );
          alert("Data.json page name does not match current page. Use the Rebuild data.json Action fix this.");
        }

      } catch(e) {
        pageDetails.errors += "The file data.json is broken <br/>";
        extraActions.push( {fn: "rebuildPageData", name: "Rebuild data.json", description: "Rebuild the page data.json file", icon: "/OpenForum/Images/icons/png/wrench.png"} );
        alert("The file data.json is broken. Use the Rebuild data.json Action fix this.");
      }
    } else {
      //overviewTree.pageDetails.metaData.addChild("No data.json present");
        pageDetails.errors += "No data.json is present <br/>";
      extraActions.push( {fn: "rebuildPageData", name: "Rebuild data.json", description: "Rebuild the page data.json file", icon: "/OpenForum/Images/icons/png/wrench.png"} );
      alert("Data.json is missing. Use the Rebuild data.json Action fix this.");
    }

    var addUsers = function addUsers(node,users) {
      if(!node) return;
      for(var user in users) node.addChild(user,{icon: "user_green"});
    };

    var addAccess = function(node,access) {
      if(!node) return;
      var canRead = node.addChild("Read",{icon: "user_green"});
      addUsers(canRead,access.read);
      var canCall = node.addChild("Call",{icon: "user_green"});
      addUsers(canCall,access.call);
      var canUpdate = node.addChild("Update",{icon: "user_green"});
      addUsers(canUpdate,access.update);
      var canDelete = node.addChild("Delete",{icon: "user_green"});
      addUsers(canDelete,access["delete"]);
    };

    var accessData = null;
    if(OpenForum.fileExists(pageName+"/access.json")) {
       accessData = OpenForum.loadFile( pageName+"/access.json" );
    } else {
      var path = OpenForum.file.getPageInheritedFilePath(pageName,"access.json");
      //Bug fix
      if(path.indexOf("/")!==0) path = "/" + path;
       accessData = OpenForum.loadFile( path+"/access.json" );
    }
    
    if( accessData != null) {
      var access = JSON.parse(accessData);
      if(access.userAccess) {
        var userAccess = {};
        
        var createUser = function(user) {
          if( isUndefined(userAccess[user]) )
          userAccess[user] = {name: user, rights: ""};
        };
        
        for( var user in access.userAccess.read) {
          createUser( user );
          userAccess[user].rights += "Read";
        }
        for( var user in access.userAccess.access) {
          createUser( user );
          if(userAccess[user].rights.length>0) userAccess[user].rights += ", ";
          userAccess[user].rights.rights += "Access";
        }
        for( var user in access.userAccess.update) {
          createUser( user );
          if(userAccess[user].rights.length>0) userAccess[user].rights += ", ";
          userAccess[user].rights += "Update";
        }
        for( var user in access.userAccess.delete) {
          createUser( user );
          if(userAccess[user].rights.length>0) userAccess[user].rights += ", ";
          userAccess[user].rights += "Delete";
        }
        pageDetails.userAccess = [];
        for(var u in userAccess) {
        	pageDetails.userAccess.push( userAccess[u] );
        }
      }
      if(access.groupAccess) {
        var groupAccess = {};
        
        var createGroup = function(name) {
          if( isUndefined(groupAccess[name]) )
          groupAccess[name] = {name: name, rights: ""};
        };
        
        for( var name in access.groupAccess.read) {
          createGroup( name );
          groupAccess[name].rights += "Read";
        }
        for( var name in access.groupAccess.access) {
          createGroup( name );
          if(groupAccess[name].rights.length>0) groupAccess[name].rights += ", ";
          groupAccess[name].rights += "Access";
        }
        for( var name in access.groupAccess.update) {
          createGroup( name );
          if(groupAccess[name].rights.length>0) groupAccess[name].rights += ", ";
          groupAccess[name].rights += "Update";
        }
        for( var name in access.groupAccess.delete) {
          createGroup( name );
          if(groupAccess[name].rights.length>0) groupAccess[name].rights += ", ";
          groupAccess[name].rights += "Delete";
        }
        pageDetails.groupAccess = [];
        for(var g in groupAccess) {
        	pageDetails.groupAccess.push( groupAccess[g] );
        }
      }

      //overviewTree.render();
    } else {
      pageDetails.errors += "No access.json present<br/>";
      //overviewTree.access.data.addChild("No access.json present");
      //overviewTree.render();
    }

    new Process().waitFor( function() { return attachmentsReady; }).then( function() { openForFlavour(); showPage(); }).run();

    pageDetails.builderPath = OpenForum.file.getPageInheritedFilePath(pageName,"page.build.js");
    pageDetails.templatePath = OpenForum.file.getPageInheritedFilePath(pageName,"page.html.template");
    pageDetails.accessPath = OpenForum.file.getPageInheritedFilePath(pageName,"access.json");
    //Bug fix
    if(pageDetails.accessPath.indexOf("/")!=0) pageDetails.accessPath = "/" + pageDetails.accessPath;
	pageDetails.accessPathEditLink = "/OpenForum/Authorization/AccessAdministration?pageName=/" + pageDetails.accessPath;
	pageDetails.accessPathPageEditLink = "/OpenForum/Authorization/AccessAdministration?pageName=" + pageName;
    
    if( OpenForum.fileExists( pageName + "/" + "notes.txt" ) ) {
      pageDetails.extras += "<a href='' onClick='showTab( addEditor(pageName,\"notes.txt\",\"text\").id ) ; return false;'>Read Notes</a><br/>";
    }
    if( OpenForum.fileExists( pageName + "/QuickReference/" + "page.html.fragment" ) ) {
      pageDetails.extras += "<a href='' onClick='displayContentTab(pageName+\"/QuickReference/\",\"page.html.fragment\",\"Quick Reference\"); return false;'>Open Quick Reference</a><br/>";
    }
    if( OpenForum.fileExists( pageName + "/" + "release-info.json" ) ) {
      OpenForum.loadJSON( pageName + "/" + "release-info.json" , function(json) {
      	pageDetails.extras += "<b>Release Version " + json.version + "</b><br/>";
        if(json.extras && json.extras.notes) {
        	pageDetails.extras += json.extra.notes.replaceAll("\n","<br/>");
        }
      });
    }

    setKeyMappings();

    setTimeout(checkForChanges,5000);
    //setInterval(loadUpdatedFilesList,10000);

  } catch( e ) {
    document.getElementById("loading-splash").innerHTML = "<h1>Error Loading Page<h1> <p>"+e+"<p>";
  }

  OpenForum.getObject("fileNameFilter").addListener(updateAttachmentsFilter);
};

function showPage() {
  document.getElementById("loading-splash").style.display="none";
  document.getElementById("page").style.display="block";

  $(document).foundation('reflow');
}

var timeOffset = OpenForum.getSystemTime().getTime() - new Date().getTime();
var lastCheckTime = new Date().getTime() + timeOffset;
function checkForChanges() {
  JSON.get("/OpenForum/Editor","getUpdates","pageName="+pageName+"&lastCheckTime="+lastCheckTime).onSuccess( processChanges ).go();
  JSON.get("/OpenForum/Actions/User","getCurrentUser").onSuccess( checkUser ).go();
}

function checkUser(response) {
  if(response.data!=currentUser) {
    currentUser = response.data;
    if(response=="Guest") {
      showPopup("You have been logged out.\nYou may not be able to save any changes you have made.\nPlease log back in.");
      return;
    } else {
      showStatus("You have been logged in as a different user.");
    }
  }
}

function processChanges(response) {

  lastCheckTime = new Date().getTime() + timeOffset;

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

      var newData = OpenForum.loadFile(changedFile.pageName+"/"+changedFile.fileName,null,true);
      if(newData==editor.editor.getValue()) {
        continue;
      }
      if(editor.changed==" ") {
        editor.editor.setValue( newData );
        editor.changed=" ";
        showPopup( "The file "+changedFile.fileName+" you have open has been changed on the server.\nThe source in the editor has been updated." );
      } else {
        showPopup( "The file "+changedFile.fileName+" you have made changes to has been changed on the server.\nThe source in the editor has NOT been updated." );
      }
    } else {
      showStatus( "The file "+changedFile.fileName+" has been changed on the server." );

    }
  }
  if(response.changedFiles.length>0) {
    loadUpdatedFilesList();
    updateTreeView(pageName);
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
  window.open("/OpenForum/Editor/Plugins/PagePreview?pageName="+pageName);
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
  editor.style.height="inherit";

  var content = OpenForum.loadFile("/OpenForum/Editor/overview.html.fragment");
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

  updateTreeView(pageName);
  //OpenForum.crawl( document.getElementById("overviewTree") );

  currentEditor = editorList[editorIndex];
  return editorList[editorIndex];
}

function updateTreeView(pageName) {
  tree = OpenForum.createFileTree("explorer",pageName);
  //tree.init = function() {  tree.expandPath(pageName); };
  
  /*overviewTree = new Tree( "overviewTree","Page Overview",{} );
  overviewTree.pageDetails = overviewTree.addChild( "Page Details",{} );
  overviewTree.pageDetails.addChild( "Page Name: {{pageName}}",{} );
  overviewTree.pageDetails.addChild( "Page Type: {{flavour}}",{} );
  overviewTree.pageDetails.addChild( "Last Modified: {{pageLastModified}}",{} );
  overviewTree.pageDetails.addChild( "Size: {{pageSize}}",{} );
  overviewTree.pageDetails.metaData = overviewTree.pageDetails.addChild( "Meta Data: ",{} );

  overviewTree.access = overviewTree.addChild( "Page Access",{} );
  overviewTree.access.addChild( "Access Path: {{accessPath}}",{actions: [ 
    {icon: "lock_go",fn: "overviewTree.access.administerAccess", toolTip: "Adminster Access at {{accessPath}}" },
    {icon: "lock_edit",fn: "overviewTree.access.administerPageAccess", toolTip: "Adminster Access just for this page " }
  ] } );
  overviewTree.access.administerAccess = function() { window.open('/OpenForum/Authorization/AccessAdministration?pageName='+accessPath); };
  overviewTree.access.administerPageAccess = function() { window.open('/OpenForum/Authorization/AccessAdministration?pageName='+pageName); };
  overviewTree.access.data = overviewTree.access.addChild( "Access: ",{} );

  overviewTree.template = overviewTree.addChild( "Page Template",{} );
  overviewTree.template.addChild( "Template Path: {{templatePath}}",{} );
  overviewTree.template.addChild( "Builder Path: {{builderPath}}",{} );

  var render = overviewTree.render;
  overviewTree.render = function() {
    overviewTree.expandAll();
    var result = render();
    OpenForum.crawl( document.getElementById("overviewTree") );
    return result;
  };
  overviewTree.render();*/
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
  } else if(flavour=="trigger") {
    openAttachments( [
      "page.js",
      "trigger.sjs",
      "page.content"
    ]);
  } else if(flavour=="markup extension") {
    openAttachments( [
      "page.js",
      "renderer.sjs",
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
    OpenForum.showElement("editorStatus");
    statusTimeout = setTimeout(
      function(){
        showStatus("ready");
      },5000
    );
  } else {
    statusTimeout = setTimeout(
      function(){
        OpenForum.hideElement("editorStatus");
      },5000
    );
  }
}

function showPopup(message) {
  popupStatus = message.replaceAll("\n","<br/>");
  $('#statusModal').foundation('reveal', 'open');
}

var pageNote = "";
function addNote() {
  OpenForum.scan();
  $('#noteModal').foundation('reveal', 'open');
}

function editReference() {
  window.open("/OpenForum/AddOn/ContentEditor?pageName=" + pageName + "/QuickReference","reference");
}

function showQRCode() {
  window.open("/OpenForum/AddOn/QRCode/Generator?url=" + window.location.origin + pageName,"qrCode");
}

function convertToContentEditor() {
  window.open("/OpenForum/AddOn/ContentEditor/PageConverter?pageName="+pageName,"content");
}

function saveNote() {
  OpenForum.scan();
  var entry = new Date() + "\n" + pageNote + "\n\n";
  OpenForum.appendFile( pageName+"/notes.txt", entry);
  $('#noteModal').foundation('reveal', 'close');
  pageNote = "";
}

function releasePage() {
  JSON.get("/OpenForum/ReleasedPackages","release","pageName="+pageName).onSuccess(
    function(response) {
      showStatus("Page released as "+response.release.releasePackage);    
    }
  ).go();
}

function publish() {
  var practice = true;
  JSON.get("/OpenForum/AddOn/Publisher","publish","pageName="+pageName+"&practice="+practice).onSuccess(
    function(response) {
      var htmlData = "<xmp style='overflow: scroll; height: 400px;'>"+response.data.notes+"</xmp>";
      if(practice===true) {
        htmlData += "<a class='button round' href='#' onclick='publish(\"" + pageName + "\",false)'>Complete Publication of "+response.data.publishedPageName+"</a>";
      } else {
        htmlData += "<a class='button round' href='" + response.data.publishedPageName + "' target='published'>View Published Page</a>";
      }
      alert(htmlData,"Publish "+pageName+" to "+response.data.publishedPageName);
    }).go();
}

/*
{
    "pageParent": "http://open-forum.onestonesoup.org",
    "pageName": "/OpenForum/Editor",
    "title": " Editor",
    "editorConfig": "/OpenForum/Editor/editor-config.json"
}
 */
function rebuildPageData() {
  var data = {};

  try{
    data = JSON.parse( OpenForum.loadFile(pageName+"/data.json") );
  } catch(e) {
    data = {};
  }

  data.pageName = pageName;
  data.title = pageName.substring( pageName.lastIndexOf("/")+1 );
  data.pageParent = window.location.origin;

  OpenForum.saveFile( pageName+"/data.json", JSON.stringify( data, null, 4 ), function() {
    alert("Saved rebuilt data,json");
  });
}
