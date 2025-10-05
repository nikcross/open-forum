var DefaultEditor = function(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  self.ready = false;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/elegant.css");

  OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
  var cm = CodeMirror.fromTextArea(
    document.getElementById("editor"+editorIndex+"Src"),
    {                 
      theme: 'elegant',
      lineNumbers: true,
      matchBrackets: true,
      extraKeys: {
        Tab: function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join("    ");
          cm.replaceSelection(spaces);
        },
        "Ctrl-.": function(cm) {
          var range = { from: cm.getCursor(true), to: cm.getCursor(false) };
          cm.autoFormatRange(range.from, range.to); 
        }
      },
      gutters: ["comments", "CodeMirror-linenumbers"]
    }
  );

  var addComment = function() {
    var marker = document.createElement("div");
    marker.style.color = "#00ff00";
    marker.innerHTML = "●";
    return marker;
  };

  cm.on("gutterClick", function(cm, n) {
    var info = cm.lineInfo(n);
    cm.setGutterMarker(n, "comments", addComment() );
  });

  cm.setValue("Loading...");

  cm.setSize(null,"100%");

  var source = "";
  //load source if exists
  if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
    source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
  } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/default",fileName+".default")==="true") {
    source = OpenForum.loadFile("/OpenForum/FileTemplates/default/"+fileName+".default");
    source = source.replace("Author:","Author: " +user.profile.userName);
  } else {
    source = OpenForum.loadFile("/OpenForum/FileTemplates/default/default.txt");
    source = source.replace("Author:","Author: " +user.profile.userName);
  }
  cm.setValue(source);

  cm.setSize(null,"100%"); 

  cm.refresh();

  //Not used
  self.editorConfig = {
    flavour: "Default",
    editingFileName: "sandbox.txt",
    fileExtension: "txt",
    elementId: "textEditor"
  };

  self.init = function() {};

  self.refresh = function() {
    if(cm) cm.refresh();
  };

  self.getValue = function() {
    return cm.getValue();
  };

  self.getCodeMirror = function() {
    return cm;
  };

  self.setValue = function(newData) {
    return cm.setValue(newData);
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    if(fileName.endsWith(".link")) {
      data += renderTabOption("Open Link to Edit","Open "+source+" in new editor tab.","editorList["+editorIndex+"].editor.openLinkToEdit()");
      data += renderTabOption("Fork Link","Replace link with copy of "+source+" in this page.","editorList["+editorIndex+"].editor.forkLink()");
    }
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

  self.openLinkToEdit = function() {
    var linkFileName = source.substring(source.lastIndexOf("/")+1);
    linkPageName = source.substring(0,source.lastIndexOf("/"));
    window.open("/OpenForum/Editor?pageName="+linkPageName+"&fileName="+linkFileName,"LinkEditor");
  };

  self.forkLink = function() {
    forkAttachment(editorIndex);
  };

  cm.on("change", function(cm, change) {
    if(markChanged) {
      //Search because array size can change if tabs closed
      //but editorIndex is a closure in this case
      for(var i in editorList) {
        if(editorList[i].id==editorIndex) {
          editorList[i].changed="*";
          return;
        }
      }
    }
  });

  self.ready = true;
};
