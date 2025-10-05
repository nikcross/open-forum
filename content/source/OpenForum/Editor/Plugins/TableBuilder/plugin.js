if( typeof tableBuilder === "undefined" ) {
  tableBuilder = {
    open: false,
    close: function() {
      tableBuilder.open = false;
    }
  };

  tableBuilder.tableFields = "";
  tableBuilder.exampleTableHtml = "<!-- html -->";
  tableBuilder.exampleTableScript = "";
  
  tableBuilder.actions = {
    edit: false,
    move: false,
    remove: false,
    add: false,
    save: false,
    sort: false
  };

  tableBuilder.buildTable = function() {
    OpenForum.scan();
    
    var form = OpenForum.TableBuilder.buildTable( tableBuilder.tableFields , tableBuilder.tableName, tableBuilder.actions );
    
    tableBuilder.exampleTableHtml = form.html;
    tableBuilder.exampleTableScript =  "<script>\n" + form.script + "\n</script>\n";
      
    try {
    	OpenForum.evaluate( form.script );
    } catch(e) { console.log(e); }
    
    var element = document.getElementById("theTable");
    element.innerHTML = tableBuilder.exampleTableHtml;
    OpenForum.crawl( element );
    OpenForum.scan();
    
    OpenForum.later = function( call) {
      setTimeout( call, 100 );
    };
    
    OpenForum.later( function() { OpenForum.evaluate( "OpenForum.Table.closeTable( " + "theTable" + " );" ); } );
  };

  tableBuilder.copyHtml = function() {
    OpenForum.copyData(tableBuilder.exampleFormHtml);
    alert("Copied to clipboard");
  };

  try{
    tableBuilder.buildTable();
  } catch(e) {}

  addPlugin( {
    name: "tableBuilder",
    init: function() {
      if(tableBuilder.open===true) {
        return;
      }
      tableBuilder.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/TableBuilder/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      /**/
      DependencyService.createNewDependency()
        .addDependency("/OpenForum/Editor/Editors/StandaloneEditor.js")
        .addDependency("/OpenForum/Editor/Plugins/TableBuilder/TableBuilder.js")
        .setOnLoadTrigger( function() {

        var editorConfig = {
          flavour: "Default",
          editingPageName: "/OpenForum/Editor/Plugins/TableBuilder",
          editingFileName: "table-definition.txt",
          elementId: "defaultEditor",
          bind: "tableBuilder.tableFields",
          retrieve: false,
          inPlugin: true
        };
        var textEditor = new StandaloneEditor( editorConfig );

      } ).loadDependencies();

      /**/

      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      OpenForum.addListener( "tableBuilder.tableFields", tableBuilder.buildTable );
      OpenForum.addListener( "tableBuilder.actions", tableBuilder.buildTable );
      OpenForum.addListener( "tableBuilder.tableName", tableBuilder.buildTable );

      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Table Builder", changed: "", options: [], plugin: tableBuilder};
      showTab(editorIndex);
      return editorList[editorIndex];
    }
  }) ;

} else {
  for(var i in editorList) {
    if(editorList[i].name==="Table Builder") {
      showTab( editorList[i].id );
      break;
    }
  }
}