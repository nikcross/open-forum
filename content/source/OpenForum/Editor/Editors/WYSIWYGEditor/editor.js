function WYSIWYGEditor(editorIndex,pageName,fileName) {
  var self = this;
  var editorField = "editor"+editorIndex+"Src";
  var alloyEditor;
  var source = "";
  var changeListener;

  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/WYSIWYGEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/html",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/html/default.html");
    }
  };

  self.initEditor = function() {
    //=======================

    var selections = [{
      name: 'link',
      buttons: ['linkEdit'],
      test: AlloyEditor.SelectionTest.link
    }, {
      name: 'image',
      buttons: ['imageLeft', 'imageCenter', 'imageRight'],
      test: AlloyEditor.SelectionTest.image
    }, {
      name: 'text',
      buttons: ['h1', 'h2', 'bold', 'italic', 'link', 'ol', 'ul', 'indentBlock', 'outdentBlock', 'quote', 'code', 'subscript', 'superscript'],
      test: AlloyEditor.SelectionTest.text
    }, {
      name: 'table',
      buttons: ['tableRow', 'tableColumn', 'tableCell', 'tableRemove'],
      getArrowBoxClasses: AlloyEditor.SelectionGetArrowBoxClasses.table,
      setPosition: AlloyEditor.SelectionSetPosition.table,
      test: AlloyEditor.SelectionTest.table
    }];

    $("#"+editorField).val("");
    alloyEditor = AlloyEditor.editable(editorField, {
      toolbars: {   
        add: {
          buttons: ['image', 'camera', 'hline', 'table'],
          tabIndex: 2
        },
        styles: {
          selections: selections
        }
      }
    });
    //=======================    


    self.setValue(source);
    checkForChanges();
  };

  self.refresh = function() {
  };

  self.getValue = function() {
    if(!alloyEditor) return "";
    return alloyEditor.get('nativeEditor').getData();
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
    if(newData.indexOf("<div class=\"row\">")!==0) {
      newData = "<div class=\"row\">"+newData+"</div>";
    }
    alloyEditor.get('nativeEditor').setData(newData);
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    return data;
  };

  self.documentation = [
  ];


  OpenForum.loadCSS("/OpenForum/Javascript/Alloy/alloy-editor/assets/alloy-editor-ocean-min.css");
  CKEDITOR_BASEPATH = '/OpenForum/Javascript/Alloy/alloy-editor/';
  ALLOYEDITOR_BASEPATH = '/OpenForum/Javascript/Alloy/alloy-editor/';

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/Alloy/alloy-editor/alloy-editor-all.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
    o.initEditor();
  } ).loadDependencies();

}