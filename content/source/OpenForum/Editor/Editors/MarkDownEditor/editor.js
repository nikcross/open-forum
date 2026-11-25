function MarkDownEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  self.ready = false;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    var content = OpenForum.loadFile("/OpenForum/Editor/Editors/MarkDownEditor/page.html.fragment");
    content = content.replace(/\{\{editorIndex\}\}/g,editorIndex);
    OpenForum.setElement("editor"+editorIndex,content);

    var autocomplete = new Autocomplete( "markdown" );
    /*autocomplete.addCompleter(
      function (params) {
        var list = [];
        var exclusive = false;
        if(params.toCursor.endsWith("O")) {
          list.push("penForum");
        } else if(params.toCursor.endsWith("OpenForum")) {
          list.push(".setElement();");
          list.push(".getElement();");
          list.push(".showTab();");
          list.push(".loadScript();");
          exclusive = true;
        }
        return {list: list, exclusive: exclusive};
      }
    );*/

    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
      { 
        theme: 'cobalt',
        lineNumbers: true,
        matchBrackets: true,
        autoMatchParens: true,
        continueComments: "Enter",
        extraKeys: {
          "Ctrl-Q": "toggleComment",
          "Ctrl-Space": "autocomplete"
        },
        viewportMargin: Infinity,
        mode: "markdown",
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists

    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/md",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/md/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/md/default.md");
    }
    cm.setValue(source);

    cm.setSize(null,"100%");

    cm.refresh();

    cm.on("change", function(cm, change) {
      if(markChanged) {
        editorList[editorIndex].changed="*";
      }
    });
    self.ready = true;
  };

  self.getCodeMirror = function() {
    return cm;
  };

  self.refresh = function() {
    if(cm) cm.refresh();
  };

  self.getValue = function() {
    return cm.getValue();
  };

  self.setValue = function(newData) {
    cm.setValue(newData);
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
  
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/cobalt.css");

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/markdown/markdown.js")
    .addDependency("/OpenForum/Editor/Editors/Autocomplete.js")

    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}

