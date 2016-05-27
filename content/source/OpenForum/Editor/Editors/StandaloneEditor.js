OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");

if(typeof(editors)=="undefined") {
  editors = [];
}
if(typeof(editorList)=="undefined") {
  editorList = [ {changed: ""} ];
}

function StandaloneEditor( config ) {
  var self = this;
  var id = "editor:"+Math.random()+":"+new Date().getTime();
  editors[id] = this;

  var flavour = "HTML";
  var elementId = "htmlEditor";
  var autoSave = false;
  var tree;
  var editor = null;
  var editingPageName = "/TheLab/Sandbox";
  var editingFileName = "sandbox.html";
  var statusClearer = null;
  var status = " ";
  var lastCheckTime = new Date().getTime();
  var overrideSave = true;

  for(var i in config) {
    if(eval(i)) {
      eval(i+"=config[i]");
    }
  }

  DependencyService.createNewDependency().
  addDependency("/OpenForum/Javascript/CodeMirror/lib/codemirror.js").
  addDependency("/OpenForum/Editor/Editors/"+flavour+"Editor/editor.js").
  addDependency("/OpenForum/Javascript/JavaWrapper/File/File.js").
  addDependency("/OpenForum/Javascript/User/open-forum-user.js").
  setOnLoadTrigger(
    function() { init(); }
  ).
  loadDependencies();

  var init = function() {
    showStatus("Loading...");

    if(overrideSave) {
      OpenForum.Browser.overrideSave( self.save );
    }

    var editorContent = OpenForum.loadFile("/OpenForum/Editor/Editors/standalone.page.html");
    editorContent = editorContent.replace(/&editor;/g,"editors['"+id+"']");

    document.getElementById(elementId).innerHTML = editorContent;
    OpenForum.crawl(document.getElementById(elementId));

    document.title = "Editing "+editingPageName+"/"+editingFileName;

    eval("editor = new "+flavour+"Editor(0,editingPageName,editingFileName);");

    editor._init = editor.init;
    editor.init = function() {
      editor._init();

      try{
        self.retrieveChanges();
      } catch(e) {
        console.log(e);
      }

      editor.getCodeMirror().on("change", function(cm, change) {
        self.storeChanges();
      });

      setInterval(autoSaveChanges,10000);
      setInterval(checkForChanges,11000);

      showStatus("Ready");
    };

    editor.init();
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
    if(editorList[0].changed==="*") {
      return true;
    } else {
      return false;
    }
  };

  self.focus = function() {
    editor.getCodeMirror().focus();
  };

  self.getCodeMirror = function() {
    return editor.getCodeMirror();
  };

  self.getValue = function() {
    return editor.getValue();
  };

  var checkForChanges = function() {
    OpenForum.file.getAttachmentTimestamp( editingPageName,editingFileName, function(modifiedTs) {
      if(modifiedTs>lastCheckTime) {
        showStatus( "The file "+editingPageName+"/"+editingFileName+" has been changed on the server." );
        if(self.hasChanges()===false) {
          self.openFile();
        }
      }
      lastCheckTime = new Date().getTime();
    }
                                         );
  };

  self.storeChanges = function() {
    localStorage.setItem( editingPageName+"/"+editingFileName, JSON.stringify({content: editor.getValue(), ts: new Date().getTime()}) );
  };

  self.retrieveChanges = function(force) {
    var record = localStorage.getItem( "/OpenForum/Editor/Editors/"+flavour );
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
        $("#confirmRetrieveModal").foundation('reveal', 'close');
      } else {
        // If time after last modified time, ask for confirmation
        OpenForum.file.getAttachmentTimestamp( editingPageName,editingFileName,
                                              function (savedTs) {
                                                if(savedTs<localChanges.ts) {
                                                  $("#confirmRetrieveModal").foundation('reveal', 'open');
                                                } else {
                                                  editor.changed="*";
                                                  editor.getCodeMirror().setValue(localChanges.content );
                                                }
                                              });
      }
    }
  };

  self.createNew = function(newFileName,keyEvent) {
    if(keyEvent) {
      if(keyEvent.charCode!=13) {
        return;
      }
    }

    editingPageName = getRoot();
    editingFileName = newFileName;
    OpenForum.saveFile(editingPageName+"/"+editingFileName,"");

    self.openFile();
  };

  var getRoot = function() {
    return OpenForum.User.getUserRoot()+"/"+flavour;
  };

  self.openFileSelect = function() {
    if(!tree) {

      var root = getRoot();

      tree = new Tree("fileTree","Loading...","");
      JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
        function(result) {
          modifyTreeNode(result);
          tree.setJSON(result);
          tree.render();
          tree.getRoot().expand();
          tree.init();
        }
      ).go();

    }

    $("#openModal").foundation('reveal', 'open');
  };

  var modifyTreeNode  =function(data) {
    delete data.attributes.link;
    if(data.attributes.actions) {
      var actions = data.attributes.actions;
      var newActions = [];
      for(var a = 0;a<actions.length;a++) {
        if(data.attributes.type==="file" && actions[a].icon==="pencil") {
          actions[a].fn = "function(node) { editors['"+id+"'].openFile('"+data.attributes.pageName+"','"+data.attributes.fileName+"'); }";
          newActions.push(actions[a]);
        }
      }
      data.attributes.actions = newActions;
    }

    for(var l=0;l<data.leaves.length;l++) {
      modifyTreeNode(data.leaves[l]);
    }
  };

  self.openFile = function( pageName,fileName ) {
    if(pageName && fileName) {
      editingPageName = pageName;
      editingFileName = fileName;
    }
    
    localStorage.setItem( "/OpenForum/Editor/Editors/"+flavour, JSON.stringify( {editingPageName: editingPageName, editingFileName: editingFileName} ) );
    editor.setValue( OpenForum.loadFile(editingPageName+"/"+editingFileName));
    lastCheckTime = new Date().getTime();

    $("#openModal").foundation('reveal', 'close');
    $("#confirmRetrieveModal").foundation('reveal', 'close');

    showStatus("Now editing "+editingPageName+"/"+editingFileName);
  };

  self.save = function() {
    OpenForum.saveFile(editingPageName+"/"+editingFileName,editor.getValue());
    editorList[0].changed="";
    localStorage.setItem( editingPageName+"/"+editingFileName,"");
    showStatus("All changes saved.");
  };

  self.uploadFromComputer = function() {
    OpenForum.Browser.upload( function(data) {editor.getCodeMirror().setValue(data); } ,showError);
  };

  self.downloadToComputer = function() {
    OpenForum.Browser.download(editingFileName,editor.getValue());
  };

  var autoSaveChanges = function() {
    if(editorList[0].changed!=="*" || autoSave===false) {
      return;
    }
    save();
  };

  var showStatus = function(message,cleared) {
    if(statusClearer!==null) {
      clearTimeout(statusClearer);
    }
    status = message;
    if(!cleared) {
      statusClearer = setTimeout( function() { showStatus("Editing "+editingPageName+"/"+editingFileName+" "+editorList[0].changed,true); },4000);
    }
  };

  var showError = function(message) {
    showStatus("Error: "+message);
  };
}