function CKEditor(editorIndex,pageName,fileName) {
  var self = this;
  var editorField = "editor"+editorIndex+"Src";
  var ckEditor;
  var source = "";
  var changeListener;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/CKEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    //load source if exists
    if(OpenForum.fileExists(pageName+"/"+fileName)==true) {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.fileExists("/OpenForum/FileTemplates/html/"+fileName+".default")==true) {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/default.html");
    }
  };

  self.initEditor = function() {
    //=======================

    //$("#"+editorField).val("");
    ClassicEditor
      .create( document.getElementById(editorField) )
      .then( newEditor => {
      ckEditor = newEditor;
      self.setValue(source);
      checkForChanges();
    } )
      .catch( error => {
      console.error( error );
    } );
    //=======================    

  };

  self.refresh = function() {
  };

  self.getValue = function() {
    if(!ckEditor) return "";
    return ckEditor.getData();
  };

  self.getCodeMirror = function(){
    return {
      on: function(event,fn){
        changeListener = fn;
      },
      setValue: function(newValue) {
        self.setValue(newValue);
      }
    };
  };

  var checkForChanges = function(  ) {
    var currentSource = self.getValue();
    if(source!=currentSource) {
      source=currentSource;
      editorList[editorIndex].changed="*";
      if(changeListener) {
        changeListener();
      }
    }
    setTimeout( function() { checkForChanges(); },1000);
  };

  self.setValue = function(newData) {
    ckEditor.setData( newData );
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

  self.documentation = [
  ];

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CKEditor/ck-classic-editor.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
    o.initEditor();
  } ).loadDependencies();

}