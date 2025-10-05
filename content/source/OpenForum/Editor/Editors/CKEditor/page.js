OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var editor;

OpenForum.init = function() {  
  var editorConfig = {
      flavour: "CK",
      editingFileName: "page.content",
      elementId: "InPageEditor",
      autoSave: false
    };
  
  if(OpenForum.getParameter("pageName")) {
    editorConfig.editingPageName = OpenForum.getParameter("pageName");
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
