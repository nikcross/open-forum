var dataTransform = {
  input:null,
  process:null,
  output: null,
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  transformFileName: "untitled.transform.js"
};

addPlugin( {
  name: "Data Transform",
  init: function() {
    if(dataTransform.open===true) {
      return;
    }
    dataTransform.open=true;
    editorIndex++;
    var editor = document.createElement("div");
    editor.setAttribute("id","editor"+editorIndex);
    editor.setAttribute("style","display:block; height: inherit;");
    document.getElementById("editors").appendChild(editor);

    var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/DataTransform/page.html.fragment");
    OpenForum.setElement("editor"+editorIndex,content);

    dataTransform.input = CodeMirror.fromTextArea(
      document.getElementById("dataTransform.input"),
      {                 
        theme: 'elegant',
        lineNumbers: true,
        matchBrackets: true
      }
    );
    dataTransform.input.setSize(null,"100%");

    dataTransform.process = CodeMirror.fromTextArea(
      document.getElementById("dataTransform.process"),
      { 
        theme: 'rubyblue',
        lineNumbers: true,
        matchBrackets: true,
        autoMatchParens: true,
        continueComments: "Enter",
        extraKeys: {
          "Ctrl-Q": "toggleComment",
          "Ctrl-Space": "autocomplete"
        },
        viewportMargin: Infinity,
        mode: "javascript",
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true
      }
    );

    dataTransform.process.setSize(null,"100%");

    dataTransform.output = CodeMirror.fromTextArea(
      document.getElementById("dataTransform.output"),
      {                 
        theme: 'elegant',
        lineNumbers: true,
        matchBrackets: true
      }
    );
    dataTransform.output.setSize(null,"100%");

    OpenForum.addTab("editor"+editorIndex);
    editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Data Transform", changed: "", options: []};
    showTab(editorIndex);

    OpenForum.crawl(document.getElementById("dataTransform"));
    
    dataTransform.log("Data Transform Ready");
    return editorList[editorIndex];
  }

});

dataTransform.run = function(editorName,input) {
  var editor = findEditor(editorName);
  dataTransform.log("Running script from tab "+editorName);
  return eval( editor.editor.getValue() );
};

dataTransform.imp = function(editorName) {
  var editor = findEditor(editorName);
  dataTransform.input.setValue( editor.editor.getValue() );
};

dataTransform.exp = function(editorName,output) {
  var editor = findEditor(editorName);
  editor.editor.setValue( output );
};

dataTransform.applyTransform = function() {
  var process = "var input = dataTransform.input.getValue(); output=\"\"; " + dataTransform.process.getValue() + "; output;";
  dataTransform.output.setValue( eval( process ) );
};

dataTransform.openFileSelect = function() {
  if(typeof(dataTransform.tree)=="undefined") {

    dataTransform.tree = new Tree("transformFileTree","Loading...","");
    JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName=/OpenForum/Editor/Plugins/DataTransform").onSuccess(
      function(result) {
        dataTransform.modifyTreeNode(result);
        dataTransform.tree.setJSON(result);
        dataTransform.tree.render();
        dataTransform.tree.getRoot().expand();
        dataTransform.tree.init();
      }
    ).go();

  }

  $("#openTransformModal").foundation('reveal', 'open');
};

dataTransform.modifyTreeNode  =function(data) {
  delete data.attributes.link;
  if(data.attributes.actions) {
    var actions = data.attributes.actions;
    var newActions = [];
    for(var a = 0;a<actions.length;a++) {
      if(data.attributes.type==="file" && actions[a].icon==="pencil") {
        actions[a].fn = "function(node) { dataTransform.openFile('"+data.attributes.pageName+"','"+data.attributes.fileName+"'); }";
        newActions.push(actions[a]);
      }
    }
    data.attributes.actions = newActions;
  }

  var newLeaves = [];
  for(var l=0;l<data.leaves.length;l++) {
    var leaf = data.leaves[l];
    
    if(leaf.attributes.type==="file" && leaf.attributes.fileName.indexOf(".transform.js") == -1) {
      //data.leaves.splice(l,1);
    } else {
      newLeaves.push(leaf);
      dataTransform.modifyTreeNode(leaf);
    }
  }
  data.leaves = newLeaves;
};

dataTransform.openFile = function(pageName,fileName) {
  dataTransform.transformFileName = pageName+"/"+fileName;
  OpenForum.loadFile(pageName+"/"+fileName, function(data) {
    dataTransform.process.setValue( data );
  });  
  $("#openTransformModal").foundation('reveal', 'close');           
};

dataTransform.createNew = function(fileName) {
  dataTransform.transformFileName = fileName;
  dataTransform.process.setValue( "" );
  $("#openTransformModal").foundation('reveal', 'close');           
};

dataTransform.saveFile = function() {
  OpenForum.saveFile("/OpenForum/Editor/Plugins/DataTransform/"+dataTransform.transformFileName, dataTransform.process.getValue());
  $("#openTransformModal").foundation('reveal', 'close');           
};

  dataTransform.renderOptions = function() {
    //renderTabOption(name,toolTip,action)
    var data = "";

    data += renderTabOption("Close","Close plugin","closePlugin( "+editorIndex+" )");
    return data;
  };