OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");

if(typeof(editors)=="undefined") {
  editors = [];
}
if(typeof(editorList)=="undefined") {
  editorList = [ {changed: ""} ];
}

var autoSave = false;
var checkChanges = true;
var fileChoiceActionTitle = "Select File";
var fileChoiceAction = "Open";
var fileChoiceActionButton = "Open";

function renderTabOption(name,toolTip,action) {
  return "<li><a href=\"#\" onClick=\""+action+"; return false;\" title=\""+toolTip+"\">"+name+"</a></li>";
}

function StandaloneEditor( config ) {
  var self = this;
  var timeOffset = OpenForum.getSystemTime().getTime() - new Date().getTime();

  self.status = "status is..";
  self.pagesList = [];
  self.newPageName = "";
  self.newFileName = "";
  self.fileChoiceActionTitle = "";
  self.fileChoiceAction = "";
  self.fileChoiceActionButton = "";
  self.autoSave = false;
  self.fullScreen = false;
  self.ui = null;

  var editorButtons = null;

  var id = "editor:"+(""+Math.random()).replace(".","")+":"+new Date().getTime();
  if(config.id) id = config.id;


  editors[id] = this;
  if( !config.inPlugin ) {
    editorList[id] = {changed: ""};
  }

  var elementPX = id.replaceAll("\\.","_").replaceAll(":","_");

  var flavour = "HTML";
  var elementId = "standaloneEditor";
  var tree;
  var editor = null;
  var editorPage = "/OpenForum/Editor/Editors/";
  var editingPageName = "?";
  var editingFileName = "sandbox.html";
  var fileExtension = "html";
  var statusClearer = null;
  var status = "";
  var lastCheckTime = new Date().getTime();
  var overrideSave = true;
  var overridePageName = false;
  var retrieve = true; // Get local changes that have been stashed
  var canSetPageTitle = true; // Can set page title to name of file editing
  var waitToUpdateTree;
  var inPlugin = false; // In use in an editor plugin
  var bind = null; // Bind the edited data to an of id

  for(var i in config) {
    if( eval("typeof " + i + " !== \"undefined\"") ) {
      eval(i+"=config[i]");
    }
  }

  for(var i in config) {
    if(typeof(self[i]) !== "undefined") {
      self[i] = config[i];
    }
  }

  if(editingPageName==="?") {
    if(user && user.profile && user.profile.pages && user.profile.pages.workspace) {
      editingPageName = user.profile.pages.workspace+"/"+fileExtension;
    } else {
      editingPageName = "/TheLab/Sandbox";
    }
  }

  self.newPageName = editingPageName;
  self.newFileName = editingFileName;

  var init = function() {
    showStatus("Loading...");

    if(overrideSave) {
      OpenForum.Browser.overrideSave( self.save );
    }

    var editorContent = "";
    if(self.ui != null) {
      editorContent = OpenForum.loadFile( self.ui );
    } else if(self.fullScreen==true)  {
      editorContent = OpenForum.loadFile("/OpenForum/Editor/Editors/standalone-full.page.html");
    } else {
      editorContent = OpenForum.loadFile("/OpenForum/Editor/Editors/standalone.page.html");
    }
    if(config.id) {
      editorContent = editorContent.replace(/&editor;/g,config.id);
      editorContent = editorContent.replace(/&editorId;/g,config.id);
    } else {
      editorContent = editorContent.replace(/&editor;/g,"editors['"+id+"']");
      editorContent = editorContent.replace(/&editorId;/g,id);
      editorContent = editorContent.replace(/&elementId;/g,elementPX);
    }

    document.getElementById(elementId).innerHTML = editorContent;
    OpenForum.crawl(document.getElementById(elementId));

    editorButtons = document.getElementById("editor"+id+"Buttons");

    if(canSetPageTitle) {
      document.title = "Editing "+editingPageName+"/"+editingFileName;
    }

    eval("editor = new "+flavour+"Editor('"+id+"',editingPageName,editingFileName,false);");
    if(typeof editor.changed == "undefined") editor.changed = "";

    new Process().waitFor( function() { return editor.ready; } ).then( function() {

      if( retrieve!==false ) {
        try{
          self.retrieveChanges();
        } catch(e) {
          console.log(e);
        }
      }

      if(overridePageName) {
        editingPageName = overridePageName;
      }

      editor.getCodeMirror().on("change", function(cm, change) {
        self.storeChanges();
        editor.changed = "*";
        showStatus("Editing "+editingPageName+"/"+editingFileName + " " + editor.changed );

        if( bind != null ) {
          OpenForum.evaluate( bind + "= editors['" + id + "'].getValue();" );
        }
      });

      if( bind != null ) {
        OpenForum.evaluate( bind + "= editors['" + id + "'].getValue();" );

        OpenForum.addListener( bind , function() {
          var text = OpenForum.evaluate( "boundValue = " + bind );
          if( getValue() != text ) {
            setValue( text );
          }
        } );
      }

      setInterval(autoSaveChanges,10000);
      setInterval(checkForChanges,11000);

      onLoad();

      showStatus("Ready");
    }).run();

    self.addMenuAction("Full Screen","Make Editor Full Screen","requestFullscreen");
    
    $(document).foundation();
    console.log("Ran foundation");
  };

  var autoSaveChanges = function() {
    if( editor.changed!=="*" || autoSave===false) {
      return;
    }
    self.save();
  };

  var showStatus = function(message,cleared) {
    if(statusClearer!==null) {
      clearTimeout(statusClearer);
    }
    status = message;
    if(!cleared) {
      statusClearer = setTimeout( function() { showStatus("Editing "+editingPageName+"/"+editingFileName+" "+editor.changed,true); },4000);
    }
  };

  var showError = function(message) {
    showStatus("Error: "+message);
  };

  var checkForChanges = function() {
    if(checkChanges==false) return;

    OpenForum.file.getAttachmentTimestamp( editingPageName,editingFileName, function(modifiedTs) {
      if(modifiedTs>lastCheckTime) {
        showStatus( "The file "+editingPageName+"/"+editingFileName+" has been changed on the server." );
        if(self.hasChanges()===false) {
          openFile();
        }
      }
      lastCheckTime = new Date().getTime() + timeOffset;
    }
                                         );
  };

  var getRoot = function() {
    //return OpenForum.User.getUserRoot()+"/"+flavour;
    return editingPageName;
  };

  var initialiseTree = function() {
    var root = getRoot();

    /*tree = new Tree(id+".fileTree","Loading...","",modifyTreeNode);
    JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root+"&match=.*\."+fileExtension).onSuccess(
      function(result) {
        tree.setJSON(result);
        tree.render();
        tree.getRoot().expand();
        tree.init();
      }
    ).go();*/

    tree = OpenForum.createFileTree(id+".fileTree",root,fileExtension,modifyTreeNode);
  };

  var modifyTreeNode  =function(data) {
    delete data.attributes.link;
    if(data.attributes.actions) {
      var actions = data.attributes.actions;
      var newActions = [];
      for(var a = 0;a<actions.length;a++) {
        if(data.attributes.type==="more") {
          newActions.push(actions[a]);
        } else if(data.attributes.type==="file" && actions[a].icon==="pencil") {
          if(config.id) {
            actions[a].fn = "function(node) { "+id+".currentFileAction('"+data.attributes.pageName+"','"+data.attributes.fileName+"'); }";
          } else {
            actions[a].fn = "function(node) { editors['"+id+"'].currentFileAction('"+data.attributes.pageName+"','"+data.attributes.fileName+"'); }";
          }
          newActions.push(actions[a]);
        }
      }
      data.attributes.actions = newActions;
    }

    for(var l=0;l<data.leaves.length;l++) {
      modifyTreeNode(data.leaves[l]);
    }
  };

  var createNewFile = function( pageName,fileName ) {
    editingFileName = fileName;
    editingPageName = pageName;

    $("#"+elementPX+"openModal").foundation('reveal', 'close');
    $("#"+elementPX+"confirmRetrieveModal").foundation('reveal', 'close');

    showStatus("Now editing "+editingPageName+"/"+editingFileName);

    if( OpenForum.fileExists(editingPageName,editingFileName)==false ) {
      OpenForum.saveFile(editingPageName+"/"+editingFileName,"");
    }
    openFile();
  };

  var saveAs = function( pageName,fileName ) {
    editingFileName = fileName;
    editingPageName = pageName;

    self.save();

    $("#"+elementPX+"openModal").foundation('reveal', 'close');
    $("#"+elementPX+"confirmRetrieveModal").foundation('reveal', 'close');
    openFile();
  };

  var openFile = function( pageName,fileName ) {
    if(pageName && fileName) {
      editingPageName = pageName;
      editingFileName = fileName;
    }

    //Store the current file name for this type of editor
    localStorage.setItem( "/OpenForum/Editor/Editors/"+flavour, JSON.stringify( {editingPageName: editingPageName, editingFileName: editingFileName} ) );

    showStatus("Loading "+editingPageName+"/"+editingFileName);
    OpenForum.loadFile(editingPageName+"/"+editingFileName, function(data) {
      if(data == null) data = "";

      editor.setValue( data );
      if( bind!=null ) {
        OpenForum.evaluate( bind + " = getValue();" );
      }
      lastCheckTime = new Date().getTime() + timeOffset;

      $("#"+elementPX+"openModal").foundation('reveal', 'close');
      $("#"+elementPX+"confirmRetrieveModal").foundation('reveal', 'close');

      showStatus("Now editing "+editingPageName+"/"+editingFileName);
    },true /*No Cache*/);
  };

  DependencyService.createNewDependency().
  addDependency("/OpenForum/Javascript/CodeMirror/lib/codemirror.js").
  addDependency("/OpenForum/Editor/Editors/"+flavour+"Editor/editor.js").
  addDependency("/OpenForum/Javascript/JavaWrapper/File/File.js").
  addDependency("/OpenForum/Javascript/User/open-forum-user.js").
  setOnLoadTrigger(
    function() { init(); }
  ).
  loadDependencies();

  self.currentFileAction = openFile;
  self.openFile = openFile;

  var onLoad = function() {};

  self.setOnLoad = function( newOnLoad ) {
    onLoad = newOnLoad;
  };

  self.getOptions = function() {
    return editor.renderOptions();
  };

  self.requestFullscreen = function() {
    editor.requestFullscreen();
  };
  
  self.addMenuAction = function(name,toolTip,action) {
    new Process().waitFor( function() { return editorButtons!=null; }  ).then ( function() { 
      var html = "<li><a href=\"#\" onClick=\"editors['"+id+"']."+action+"(); return false;\" title=\""+toolTip+"\">"+name+"</a></li>";
      editorButtons.innerHTML += html;
    }).run();
  };

  self.getEditingPageName = function() {
    return editingPageName;
  };

  self.getEditingFileName = function() {
    return editingFileName;
  };

  self.getStatus = function() {
    return status;
  };

  self.hasChanges = function() {
    if( editor.changed==="*") {
      return true;
    } else {
      return false;
    }
  };

  self.focus = function() {
    editor.getCodeMirror().focus();
  };

  self.getCodeMirror = function() {
    if(editor) {
      return editor.getCodeMirror();
    }
  };

  self.getEditor = function() {
    return editor;
  };

  self.getValue = function() {
    return editor.getValue();
  };

  self.setValue = function(data) {
    return editor.setValue(data);
  };

  self.getEditingFileName = function() {
    return editingFileName;
  };

  self.getEditingPageName = function() {
    return editingPageName;
  };

  self.storeChanges = function() {
    //Stash current file changes
    localStorage.setItem( editingPageName+"/"+editingFileName, JSON.stringify({content: editor.getValue(), ts: new Date().getTime()}) );
  };

  self.retrieveChanges = function(force) {
    //Get stashed version of file if present and more recent than saved version
    var record = localStorage.getItem( editingPageName+"?editor="+flavour );
    if(!record) {
      record = localStorage.getItem( editorPage+flavour );
    }
    if(record) {
      record = JSON.parse(record);
      editingPageName = record.editingPageName;
      editingFileName = record.editingFileName;
    }

    var localChanges = localStorage.getItem( editingPageName+"/"+editingFileName );
    if( localChanges ) {
      localChanges = JSON.parse(localChanges);

      if(force) {
        editor.changed="*";
        editor.getCodeMirror().setValue(localChanges.content );
        $("#"+elementPX+"confirmRetrieveModal").foundation('reveal', 'close');
      } else if(checkChanges) {
        // If time after last modified time, ask for confirmation
        OpenForum.file.getAttachmentTimestamp( editingPageName,editingFileName,
                                              function (savedTs) {
          if(savedTs<localChanges.ts) {
            $("#"+elementPX+"confirmRetrieveModal").foundation('reveal', 'open');
          } else {
            editor.changed="*";
            editor.getCodeMirror().setValue(localChanges.content );
          }
        });
      }
    }
  };

  self.updateTreeView = function(newPageName) {
    if(newPageName.indexOf('~')==0) {
      if(currentUser=="Guest") {
        newPageName = "browser://";
      } else { 
        newPageName = "/OpenForum/Users/"+currentUser+"/";
      }

      //inputField.value = newPageName;
    }
    if(newPageName.indexOf("/")===0 || newPageName.indexOf("browser://")===0) {
      var newEditingPageName = newPageName;
      newPageName.substring(0,newPageName.lastIndexOf("/"));
      if(newEditingPageName!==editingPageName) {

        //Stop tree updateing too fast
        if(waitToUpdateTree) clearTimeout(waitToUpdateTree);
        waitToUpdateTree = setTimeout( function() {
          var path = editingPageName;
          editingPageName = newEditingPageName;
          if( newPageName.indexOf("browser://")==0) {
            path = newPageName;
          } else if( editingPageName.charAt(0)!='/') {
            editingPageName = "/" + editingPageName;
            path = editingPageName.substring( 0,editingPageName.lastIndexOf("/") );
          }
          if(path.length>0) {
            OpenForum.getSubPages(path,function(newList) {
              self.pagesList = newList;
            });
          }
          initialiseTree();
        },500);
      }
    }
  };

  self.openFileSaveAs = function() {
    self.newPageName = editingPageName;
    self.newFileName = editingFileName;
    self.currentFileAction = saveAs;
    self.fileChoiceActionTitle = "Save File As";
    self.fileChoiceAction = "Save as ";
    self.fileChoiceActionButton = "Save As";
    OpenForum.scan();

    if(!tree) initialiseTree();
    $("#"+elementPX+"openModal").foundation('reveal', 'open');
  };

  self.openFileCreateNew = function() {
    self.newPageName = editingPageName;
    self.currentFileAction = createNewFile;
    self.fileChoiceActionTitle = "Create New File";
    self.fileChoiceAction = "Create on ";
    self.fileChoiceActionButton = "Create";
    OpenForum.scan();

    if(!tree) initialiseTree();
    $("#"+elementPX+"openModal").foundation('reveal', 'open');
  };

  self.setFile = function(keyEvent) {  
    if(keyEvent) {
      if(keyEvent.charCode!=13) {
        return;
      }
    }

    OpenForum.scan();
    self.currentFileAction( self.newPageName, self.newFileName );
  };

  self.openFileSelect = function() {
    self.newPageName = editingPageName;
    self.newFileName = editingFileName;
    self.currentFileAction = openFile;
    self.fileChoiceActionTitle = "Select File";
    self.fileChoiceAction = "Open from ";
    self.fileChoiceActionButton = "Open";
    OpenForum.scan();

    if(!tree) initialiseTree();
    $("#"+elementPX+"openModal").foundation('reveal', 'open');
  };

  self.save = function() {
    //Guests to save to browser storage
    if(currentUser=="Guest" && editingPageName.indexOf("browser://") != 0 ) {
      editingPageName = "browser://" + editingPageName;
    }
    OpenForum.saveFile(editingPageName+"/"+editingFileName,editor.getValue(), function() {
      lastCheckTime = new Date().getTime() + timeOffset;
      editor.changed="";
      //Clear local stash for file
      localStorage.setItem( editingPageName+"/"+editingFileName,"");
      if(currentUser=="Guest") {
        showStatus("All changes saved in browser storage.");
      } else {
        showStatus("All changes saved.");
      }
    });
  };

  self.uploadFromComputer = function() {
    OpenForum.Browser.upload( function(data) {editor.getCodeMirror().setValue(data); } ,showError);
  };

  self.downloadToComputer = function() {
    OpenForum.Browser.download(editingFileName,editor.getValue());
  };

  self.copyToClipboard = function() {
    OpenForum.copyData( editor.getValue() );
  };
}