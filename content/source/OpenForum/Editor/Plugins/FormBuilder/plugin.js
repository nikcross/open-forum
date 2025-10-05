if( typeof formBuilder === "undefined" ) {
  formBuilder = {
    open: false,
    close: function() {
      formBuilder.open = false;
    }
  };

  formBuilder.formFields = "";
  formBuilder.exampleFormHtml = "<!-- html -->";
  formBuilder.exampleFormScript = "";

  formBuilder.buildForm = function() {
    OpenForum.scan();

    var form = OpenForum.FormBuilder.buildForm( formBuilder.formFields , "myForm" );
    
    formBuilder.exampleFormHtml = form.html;
    formBuilder.exampleFormScript =  "<script>\n" + form.script + "\n</script>\n";
      
    try {
    	OpenForum.evaluate( form.script );
    } catch(e) { console.log(e); }
    
    var element = document.getElementById("theForm");
    element.innerHTML = formBuilder.exampleFormHtml;
    OpenForum.crawl( element );
    
    OpenForum.scan();
  };

  formBuilder.copyHtml = function() {
    OpenForum.copyData(formBuilder.exampleFormHtml);
    alert("Copied to clipboard");
  };

  try{
    formBuilder.buildForm();
  } catch(e) {}

  addPlugin( {
    name: "formBuilder",
    init: function() {
      if(formBuilder.open===true) {
        return;
      }
      formBuilder.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/FormBuilder/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      /**/
      DependencyService.createNewDependency()
        .addDependency("/OpenForum/Editor/Editors/StandaloneEditor.js")
        .addDependency("/OpenForum/Editor/Plugins/FormBuilder/FormBuilder.js")
        .setOnLoadTrigger( function() {

        var editorConfig = {
          flavour: "Default",
          editingPageName: "/OpenForum/Editor/Plugins/FormBuilder",
          editingFileName: "form-definition.txt",
          elementId: "defaultEditor",
          bind: "formBuilder.formFields",
          retrieve: false,
          inPlugin: true
        };
        var textEditor = new StandaloneEditor( editorConfig );

      } ).loadDependencies();

      /**/

      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      OpenForum.addListener( "formBuilder.formFields", formBuilder.buildForm );

      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Form Builder", changed: "", options: [], plugin: formBuilder};
      showTab(editorIndex);
      return editorList[editorIndex];
    }
  }) ;

} else {
  for(var i in editorList) {
    if(editorList[i].name==="Form Builder") {
      showTab( editorList[i].id );
      break;
    }
  }
}