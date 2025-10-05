var ContentView = function(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  self.ready = false;
  
  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  var content = "";
  //load content if exists
  if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
    content = OpenForum.loadFile(pageName+"/"+fileName,null,true);
  } else {
    content = "<div class='row'><h1>404 - You'll not find that here.</h1></div>";
  }
  
  OpenForum.setElement("editor"+editorIndex,"<div class='row'>" + content + "</div>");

  self.init = function() {};

  self.refresh = function() {
  };

  self.getValue = function() {
    return content;
  };

  self.setValue = function(newData) {
    content = newData;
  	OpenForum.setElement("editor"+editorIndex,"<div class='row'>" + content + "</div>");
  };

  self.renderOptions = function() {
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

  self.ready = true;
};
