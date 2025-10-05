function SQLEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  self.changed = "";
  self.ready = false;

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };
  
  self.init = function() {
    OpenForum.setElement("editor"+editorIndex,"<textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea>");
    
    var autocomplete = new Autocomplete( "sql" );
    autocomplete.addCompleter(
      function (params) {
        var list = [];
        var exclusive = false;
        if(params.toCursor.endsWith("[")) {
          list.push("{Icon name=\"\"}]");
        } else if(params.toCursor.endsWith("[{icon name=\"")) {
          list.push("chart pie");
          exclusive = true;
        }
        return {list: list, exclusive: exclusive};
      }
    );
    
    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
      { 
        theme: 'blackboard',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        autofocus: true,
        extraKeys: {"Ctrl-Space": "autocomplete"}
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/sql",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/sql/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/sql/default.sql");
    }
    cm.setValue(source);

    cm.setSize(null,"100%");

    cm.refresh();

    cm.on("change", function(cm, change) {
      if(markChanged) {
        self.changed = "*";
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

  self.refresh = function() {
    if(cm) cm.refresh();
  };

  self.getValue = function() {
    return cm.getValue();
  };

  self.setValue = function(newData) {
    return cm.setValue(newData);
  };

  self.getCodeMirror = function() {
    return cm;
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Run","Run "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.run()");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,"editorList["+editorIndex+"].editor.requestFullscreen()");
    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',editorList["+editorIndex+"].editor.getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( editorList["+editorIndex+"].editor.getValue() )");

    return data;
  };

   self.run = function() {
    var pluginName = "/OpenForum/AddOn/SQL/SQLPlugin";

    loadPlugin(pluginName,
               function(plugin) {
                  showTab(plugin.editorIndex);
                  plugin.run(fileName);
                }
    );
  };
  
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/blackboard.css");
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.css");

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/sql/sql.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/show-hint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/hint/sql-hint.js")
    .addDependency("/addon/edit/matchbrackets.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/util/foldcode.js")
    .addDependency("/OpenForum/Editor/Editors/Autocomplete.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}