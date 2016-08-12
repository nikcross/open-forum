var formBuilder = {
  open: false
};

addPlugin( {
  name: "formBuilder",
  init: function() {
      if(formBuilder.open===true) {
        return;
      }
      formBuilder.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/FormBuilder/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);
    
      OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      
            OpenForum.addTab("editor"+editorIndex);
            editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "FormBuilder", changed: "", options: []};
            showTab(editorIndex);
            return editorList[editorIndex];
          }
      }
) ;


formBuilder.formFields = "Name name";
formBuilder.exampleFormHtml = "< html >";

formBuilder.buildForm = function() {
  var fields = formBuilder.formFields.split("\n");
  formBuilder.exampleFormHtml = "<form>\n";
  var currentGroup = [];
  for(var i=0;i<fields.length;i++) {
    if(fields[i].length===0) {
      if(currentGroup.length>0) {
        formBuilder.renderFormRow(currentGroup);
        currentGroup=[];
      }
      continue;
    }

    var cell = fields[i].split(" ");
    var type = "text";
    var name = cell[0];
    var id = name;
    if(cell.length===2) {
      id = cell[1];
    }
    currentGroup.push({name: name, id: id ,type: type});
  }
  if(currentGroup.length>0) {
    formBuilder.renderFormRow(currentGroup);
    currentGroup=[];
  }
  formBuilder.exampleFormHtml += "</form>\n";

  document.getElementById("html").innerHTML=formBuilder.exampleFormHtml;
};

formBuilder.renderFormRow = function(currentGroup) {

  var columns = 12;
  var columnPerField = Math.floor(columns/currentGroup.length);
  if(columnPerField===0) {
    columnPerField=1;
  }
  formBuilder.exampleFormHtml += "<div class='row'>\n";
  var fieldColumns = columnPerField;
  for(var f=0;f<currentGroup.length;f++) {
    formBuilder.exampleFormHtml += "<div class='large-"+fieldColumns+" columns'>\n";
    formBuilder.renderFormField(currentGroup[f]);
    formBuilder.exampleFormHtml += "</div>\n";
  }
  formBuilder.exampleFormHtml += "</div>\n";
};

formBuilder.renderFormField = function(field) {
  formBuilder.exampleFormHtml += "<label>"+field.name;
  formBuilder.exampleFormHtml += "<input type='text' id='"+field.id+"' placeholder=' ' />";
  formBuilder.exampleFormHtml += "</label>\n";
};