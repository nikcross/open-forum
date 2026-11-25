function YAMLEditor(editorIndex,pageName,fileName,markChanged) {
  var self = this;
  var cm = null;
  var statusId = "editor"+editorIndex+"Status";
  var formatConfirmUntil = 0;
  self.changed = "";
  self.ready = false;

  //Menu options call back in through here, as editorList positions shift when tabs close
  YAMLEditor.instances[editorIndex] = self;
  var ref = "YAMLEditor.instances['"+editorIndex+"']";

  self.requestFullscreen = function() {
    document.getElementById( "editor"+editorIndex ).requestFullscreen();
  };

  var showStatus = function(message,isError) {
    var element = document.getElementById(statusId);
    if(!element) return;
    element.textContent = message;
    element.style.color = isError ? "#ff8080" : "#a0d0a0";
  };

  var lintYAML = function(text) {
    var result = YAMLEditor.validate(text);
    if(result.valid) {
      showStatus("Valid YAML" + (result.documents>1 ? " ("+result.documents+" documents)" : ""));
      return [];
    }
    showStatus("Line "+(result.line+1)+", column "+(result.column+1)+": "+result.message,true);
    return [{
      from: CodeMirror.Pos(result.line, result.column),
      to: CodeMirror.Pos(result.line, result.column+1),
      message: result.message,
      severity: "error"
    }];
  };

  self.init = function() {
    OpenForum.setElement("editor"+editorIndex,
      "<div style=\"height: 100%; display: flex; flex-direction: column;\">"+
      "<div style=\"flex: 1; min-height: 0;\"><textarea id=\"editor"+editorIndex+"Src\">Loading...</textarea></div>"+
      "<div id=\""+statusId+"\" style=\"font-family: monospace; font-size: 0.8em; padding: 2px 8px; background: #0c1021; color: #a0d0a0;\">Loading...</div>"+
      "</div>");

    cm = CodeMirror.fromTextArea(
      document.getElementById("editor"+editorIndex+"Src"),
      {
        theme: 'blackboard',
        mode: "yaml",
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        autofocus: true,
        //The YAML mode has no fold helper of its own, so fold by indentation
        foldGutter: { rangeFinder: CodeMirror.fold.indent },
        gutters: ["CodeMirror-lint-markers","CodeMirror-linenumbers","CodeMirror-foldgutter"],
        lint: { getAnnotations: lintYAML },
        extraKeys: {
          //YAML does not allow tabs for indentation
          "Tab": function(cm) {
            if(cm.somethingSelected()) {
              cm.indentSelection("add");
            } else {
              cm.replaceSelection("  ","end");
            }
          },
          "Shift-Tab": function(cm) { cm.indentSelection("subtract"); },
          "Ctrl-Q": function(cm) { cm.foldCode(cm.getCursor(),CodeMirror.fold.indent); }
        }
      }
    );
    cm.setValue("Loading...");

    var source = "";
    //load source if exists
    if(OpenForum.file.attachmentExists(pageName,fileName)==="true") {
      source = OpenForum.loadFile(pageName+"/"+fileName,null,true);
    } else if(OpenForum.file.attachmentExists("/OpenForum/FileTemplates/yaml",fileName+".default")==="true") {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/yaml/"+fileName+".default");
    } else {
      source = OpenForum.loadFile("/OpenForum/FileTemplates/yaml/default.yaml");
    }
    cm.setValue(source);
    //So Ctrl-Z cannot undo back to the Loading... placeholder
    cm.clearHistory();

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

  //Replace the whole document as one edit, so Ctrl-Z brings the old text back
  var replaceAll = function(text) {
    cm.replaceRange(text, CodeMirror.Pos(cm.firstLine(),0), CodeMirror.Pos(cm.lastLine()));
  };

  var jsonFileName = function() {
    return fileName.replace(/\.(yaml|yml)$/i,"") + ".json";
  };

  self.format = function() {
    var text = cm.getValue();
    var result = YAMLEditor.format(text);
    if(result.error) {
      showStatus("Not formatted. "+result.error,true);
      return;
    }
    var comments = YAMLEditor.countComments(text);
    if(comments>0 && new Date().getTime()>formatConfirmUntil) {
      formatConfirmUntil = new Date().getTime()+10000;
      showStatus("Formatting removes "+comments+" comment"+(comments==1?"":"s")+". Choose Format again within 10 seconds to go ahead.",true);
      return;
    }
    formatConfirmUntil = 0;
    if(result.text!==text) {
      replaceAll(result.text);
    }
    showStatus("Formatted. Ctrl-Z undoes it.");
  };

  self.copyAsJSON = function() {
    var result = YAMLEditor.toJSON(cm.getValue());
    if(result.error) {
      showStatus("Not converted. "+result.error,true);
      return;
    }
    OpenForum.copyData(result.text);
    showStatus("JSON copied to the clipboard.");
  };

  self.downloadAsJSON = function() {
    var result = YAMLEditor.toJSON(cm.getValue());
    if(result.error) {
      showStatus("Not converted. "+result.error,true);
      return;
    }
    OpenForum.Browser.download(jsonFileName(),result.text);
    showStatus("Downloaded "+jsonFileName()+".");
  };

  self.convertFromJSON = function() {
    var result = YAMLEditor.fromJSON(cm.getValue());
    if(result.error) {
      showStatus("Not converted. "+result.error,true);
      return;
    }
    replaceAll(result.text);
    showStatus("Converted JSON to YAML. Ctrl-Z undoes it.");
  };

  self.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close editor","closeEditor( "+editorIndex+" )");
    data += renderTabOption("Full Screen","Full Screen "+pageName+"/"+fileName,ref+".requestFullscreen()");
    data += renderTabOption("Save","Save "+pageName+"/"+fileName,"saveFile( '"+pageName+"' , '"+fileName+"' )");
    data += renderTabOption("Format","Reformat the YAML with 2 space indentation (removes comments)",ref+".format()");
    data += renderTabOption("Copy as JSON","Copy the YAML to the clipboard as JSON",ref+".copyAsJSON()");
    data += renderTabOption("Download as JSON","Download the YAML as "+jsonFileName(),ref+".downloadAsJSON()");
    data += renderTabOption("JSON to YAML","Replace JSON pasted into the editor with the same data as YAML",ref+".convertFromJSON()");
    data += renderTabOption("Download to desktop","Download "+pageName+"/"+fileName,"OpenForum.Browser.download( '"+fileName+"',"+ref+".getValue() )");
    data += renderTabOption("Copy","Copy to clipboard","OpenForum.copyData( "+ref+".getValue() )");

    return data;
  };

  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/theme/blackboard.css");
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/lint/lint.css");
  OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/addon/fold/foldgutter.css");

  DependencyService.createNewDependency()
    .addDependency("/OpenForum/Javascript/JSYaml/js-yaml.min.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/mode/yaml/yaml.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/edit/matchbrackets.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/lint/lint.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/fold/foldcode.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/fold/foldgutter.js")
    .addDependency("/OpenForum/Javascript/CodeMirror/addon/fold/indent-fold.js")
    .setOnLoadTrigger( function() {
    var o = self;
    o.init();
  } ).loadDependencies();

}

YAMLEditor.instances = {};

//YAML helpers using js-yaml (jsyaml). Each returns {text} or {error} and never throws.
//A file can hold several documents separated by ---, so everything goes through loadAll.

YAMLEditor.describeError = function(e) {
  var message = e.reason || e.message || (""+e);
  if(e.mark) {
    message = "Line "+(e.mark.line+1)+", column "+(e.mark.column+1)+": "+message;
  }
  return message;
};

YAMLEditor.validate = function(text) {
  try {
    var documents = jsyaml.loadAll(text);
    return {valid: true, documents: documents.length};
  } catch(e) {
    return {
      valid: false,
      message: e.reason || e.message || (""+e),
      line: e.mark ? e.mark.line : 0,
      column: e.mark ? e.mark.column : 0
    };
  }
};

YAMLEditor.dumpOptions = {indent: 2, lineWidth: -1, noRefs: true};

YAMLEditor.format = function(text) {
  var documents;
  try {
    documents = jsyaml.loadAll(text);
  } catch(e) {
    return {error: YAMLEditor.describeError(e)};
  }
  if(documents.length===0) {
    return {error: "There is no YAML to format."};
  }
  var parts = [];
  for(var i=0;i<documents.length;i++) {
    parts.push( jsyaml.dump(documents[i],YAMLEditor.dumpOptions) );
  }
  return {text: parts.join("---\n")};
};

YAMLEditor.toJSON = function(text) {
  var documents;
  try {
    documents = jsyaml.loadAll(text);
  } catch(e) {
    return {error: YAMLEditor.describeError(e)};
  }
  if(documents.length===0) {
    return {error: "There is no YAML to convert."};
  }
  //Several documents become a JSON array of documents
  var data = documents.length===1 ? documents[0] : documents;
  return {text: JSON.stringify(data,null,2)};
};

YAMLEditor.fromJSON = function(text) {
  if(text.trim().length===0) {
    return {error: "Paste JSON into the editor first."};
  }
  var data;
  try {
    data = JSON.parse(text);
  } catch(e) {
    return {error: "The editor does not hold valid JSON: "+e.message};
  }
  return {text: jsyaml.dump(data,YAMLEditor.dumpOptions)};
};

//Counts lines holding a # comment, ignoring # inside quoted strings.
//A quote only opens a string at the start of a value, so it's in a plain value is not a string.
YAMLEditor.countComments = function(text) {
  var count = 0;
  var lines = text.split("\n");
  for(var l=0;l<lines.length;l++) {
    var line = lines[l];
    var quote = null;
    var previous = "";
    for(var c=0;c<line.length;c++) {
      var ch = line.charAt(c);
      if(quote) {
        if(ch===quote) quote = null;
      } else if((ch==="'" || ch==="\"") && "-:,[{?".indexOf(previous)!==-1) {
        quote = ch;
      } else if(ch==="#" && (c===0 || line.charAt(c-1)===" " || line.charAt(c-1)==="\t")) {
        count++;
        break;
      }
      if(ch!==" " && ch!=="\t") previous = ch;
    }
  }
  return count;
};

