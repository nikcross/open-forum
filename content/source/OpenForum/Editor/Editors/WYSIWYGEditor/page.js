OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {  
  var editorConfig = {};
  if(OpenForum.getParameter("pageName")) {
    editorConfig = {
      flavour: "WYSIWYG",
      editingPageName: OpenForum.getParameter("pageName"),
      editingFileName: "page.content",
      elementId: "wysiwygEditor",
      autoSave: false
    };
  }

  editor = new StandaloneEditor( editorConfig );
  whenReady(editorConfig);
};

function whenReady(config) {
  if(document.getElementById("standalone-buttons")) {
    document.getElementById("standalone-buttons").innerHTML += "<a class=\"button round tiny\" href=\""+config.editingPageName+"\" target=\"pageView\">View Page</a>";
    document.getElementById("standalone-buttons").innerHTML += "<a class=\"button round tiny\" href=\"/OpenForum/Editor/LivePageView?pageName="+config.editingPageName+"\" target=\"pageView\"><img src=\"/OpenForum/Images/icons/png/lightning.png\"> View Page Live</a>";
    
    
  } else {
    setTimeout( function(){ whenReady(config); },1000 );
  }
}
