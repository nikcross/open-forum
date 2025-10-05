/*
* Author: 
* Description: 
*/
if( typeof console == "undefined" ) { // Running server side
  console = {
    log: function(message) {}
  };
  Common = js.getObject("/OpenForum/Javascript","Common.sjs");
  Common.extendString(String);
}

var FormBuilder = function() {
  var self = this;

  var js;

  self.setTableBuilder = function( TableBuilder ) {
    if(typeof OpenForum == "undefined") OpenForum = {};
    OpenForum.TableBuilder = TableBuilder;
  };

  var renderFormField = function(field) {
    var formHtml = "";
    var required = "";
    if( field.type=="input" ) {
      if( field.required==true ) {
        required = "<super title='This is a required' style='color: red;'>*</super>";
      }

      formHtml += "      <label>"+field.name+required+"</label>";
      formHtml += " <input type='text' id='"+field.id+"Field' of-id='"+field.id+"' placeholder=' ' />";

      if( field.validate == true ) {
        formHtml += " <small class='error' id='"+field.id+"Error' style='display: none;'>{{"+field.id+"FieldErrorMessage}}</small>";
      }

      formHtml += "\n";
    } else if( field.type=="text" ) {
      if( field.required==true ) {
        required = "<super title='This is a required' style='color: red;'>*</super>";
      }

      formHtml += "      <label>"+field.name+required+"</label>";
      formHtml += " <textarea id='"+field.id+"Field' of-id='"+field.id+"' placeholder=' '></textarea>";

      if( field.validate == true ) {
        formHtml += " <small class='error' id='"+field.id+"Error' style='display: none;'>{{"+field.id+"FieldErrorMessage}}</small>";
      }
      formHtml += "\n";
    } else if( field.type=="wysiwyg" ) {
      if( field.required==true ) {
        required = "<super title='This is a required' style='color: red;'>*</super>";
      }

      formHtml += "      <label>"+field.name+required+"</label>";

      if( field.id.endsWith(".") ) {
        formHtml += "...";
      } else {

        var rendered = OpenForum.loadFile( "/OpenForum/Actions/RenderWikiData?pageName="+pageName+"&data=" + encodeURI("[{WysiwygInput name=\""+field.id+"\" value=\"\"}]") );
        setTimeout( function() { 
          eval( rendered.between("<script>","</script>") );
        }, 1 );
        formHtml += rendered;
      }

      if( field.validate == true ) {
        formHtml += " <small class='error' id='"+field.id+"Error' style='display: none;'>{{"+field.id+"FieldErrorMessage}}</small>";
      }
      formHtml += "\n";
    } else if( field.type=="checkbox" ) {
      formHtml += "      <label>"+field.name+"</label>";
      formHtml += " <input type='checkbox' id='"+field.id+"Field' of-id='"+field.id+"' placeholder=' ' />";
      formHtml += "\n";
    } else if( field.type=="select" ) {
      if( field.required==true ) {
        required = "<super title='This is a required' style='color: red;'>*</super>";
      }

      formHtml += "      <label>"+field.name+required+"</label>";
      formHtml += " <select id='"+field.id+"Field' of-id='"+field.id+"'>" +
        "<option></option>" +
        "<option of-repeatFor='item in "+field.id+"List'>{{item}}</option>" +
        "</select>";

      if( field.validate == true ) {
        formHtml += " <small class='error' id='"+field.id+"Error' style='display: none;'>{{"+field.id+"FieldErrorMessage}}</small>";
      }
      formHtml += "\n";
    } else if( field.type=="view" ) {
      formHtml += "      <label>"+field.name+"</label>";
      formHtml += " {{"+field.id+"}}";
      formHtml += "\n";
    } else if( field.type=="action" ) {
      formHtml += "      <label>&nbsp;</label>";
      formHtml += " <a href='' onClick='" +field.id+ "(); return false;' class='button'>" + field.name + "</a>";
      formHtml += "\n";
    } else if( field.type=="title" ) {
      formHtml += "      <h1>" + field.raw.after(": ") + "</h1>";
      formHtml += "\n";
    } else if( field.type=="message" ) {
      formHtml += "      <p>" + field.raw.after(": ") + "</p>";
      formHtml += "\n";
    } else {
      formHtml += "      <p>The type " + field.type + " is not implemented.</p>";
      formHtml += "\n";
    }

    return formHtml;
  };

  var renderFormRow = function(currentGroup) {
    var formHtml = "";
    var columns = 12;
    var columnPerField = Math.floor(columns/currentGroup.length);
    if(columnPerField===0) {
      columnPerField=1;
    }
    formHtml += "  <div class='row'>\n";
    var fieldColumns = columnPerField;
    for(var f=0;f<currentGroup.length;f++) {
      formHtml += "    <div class='large-"+fieldColumns+" columns'>\n";
      formHtml += renderFormField(currentGroup[f]);
      formHtml += "    </div>\n";
    }
    formHtml += "  </div>\n";
    return formHtml;
  };

  self.buildForm = function( formDefinition, formName ) {

    try{
      var fields = formDefinition.split("\n");
      var formHtml = "<form>\n";
      var formScript = "";
      var currentGroup = [];
      var watchList = [];
      var functionList = [];
      var actions = [];
      var validationList = [];
      var preValidationList = [];
      var lists = [];

      //Pre check for form name
      for(var i=0;i<fields.length;i++) {
        var cell = fields[i];
        if( !cell.contains(":") ) continue;
        if( cell.before(":").toLowerCase() == "form name" || cell.before(":").toLowerCase() == "formname" ) {
          formName = cell.after(": ").toLowerCase();
        }
      }

      for(var i=0;i<fields.length;i++) {

        //Blank line, so end of row
        if(fields[i].length===0) {
          if(currentGroup.length>0) {
            formHtml += renderFormRow(currentGroup);
            currentGroup=[];
          }
          continue;
        }

        var cell = fields[i].split(" ");


        var type = "input";
        if(cell[0].endsWith(":")) {
          type = cell[0].before(":").toLowerCase();
          cell.splice( 0,1 );
        }
        //Just a comment
        if(type == "note") continue;
        if(type == "formname" || fields[i].toLowerCase().startsWith("form name:")) continue;
        if(type == "formid" || fields[i].toLowerCase().startsWith("form id:")) continue;

        if(type == "calculation") {

          var script = "";
          var functionName = fields[i].between(":","=");
          if( typeof functionName == "undefined" ) continue;
          functionName = functionName.trim() + "_update";
          script += "\nvar " + functionName + " = function() {\n";
          script += "    setInput();\n\n";
          script += "    "+fields[i].after(":")+";\n\n";
          script += "    setOutput();\n";
          script += "};\n";

          functionList.push( functionName );

          formScript += script;
          continue;
        }

        if(type == "list") {
          var list = fields[i].after(":").trim();
          var name = list.before(" ");
          list = list.after(" ").split(",");
          var listScript = "";
          for(var l in list) {
            if(listScript.length>0) listScript += ",";
            listScript += " '" + list[l].trim() + "' ";
          }
          formScript += "\n self." + name + "List = [" + listScript +"];\n";

          continue;
        }

        if(type == "table") {
          var columns = fields[i].after(":").trim();
          var name = columns.before(" ");
          columns = columns.after(" ").split(",");

          var tableDefinition = "";
          for( var c in columns ) {
            tableDefinition += columns[c] + "\n";
          }

          if( typeof OpenForum.TableBuilder == "undefined" ) {
            var js = OpenForum.loadFile("/OpenForum/Editor/Plugins/TableBuilder/TableBuilder.js");
            OpenForum.evaluate( js + "; window.OpenForum.TableBuilder = OpenForum.TableBuilder;" );
          }
          var tableDef = OpenForum.TableBuilder.buildTable( tableDefinition, formName + "." + name, {add: true,edit: true, remove: true} );

          formScript += tableDef.shortScript.replace( new RegExp(formName + "." + name,"g"), "self." + name  );
          formHtml += "<div class='row'>"+tableDef.html+"</div>";

          continue;
        }

        var name = cell[0];
        var id = name;
        if(cell.length>1) {
          for(var c=1; c < cell.length-1; c++) {
            name += " " + cell[c];
          }
          id = cell[cell.length-1];
        }

        var required = false;
        var validate = false;
        if( id.endsWith("*") ) {
          id = id.before( "*" );
          required = true;
          validate = true;
          //Using id stops preValidationList entry duplication
          preValidationList[formName + "." + id + "Error"] = ( "  document.getElementById('" + formName + "." + id + "Error').style.display = 'none';\n" );
          preValidationList[formName + "." + id + "FieldErrorMessage"] = ( "  " + formName + "." + id + "FieldErrorMessage = ''\n" );
          //Validation step. 
          validationList.push( "\nif( isNullOrBlank( " + formName + "." + id + " ) ) {" +
                              "  " + formName + "." + id + "FieldErrorMessage = 'Please fill in this field. It is required.';\n" +
                              "  document.getElementById('" + formName + "." + id + "Error').style.display = 'block';\n" +
                              "}\n\n" );
        }

        id = formName+"."+id;

        if( type == "action" ) {
          actions.push( id );
        } else {

          if(type != "message" && type != "title" && type != "formName") {
            watchList.push( id ); // fields to watch for calculations
          }
        }
        currentGroup.push({name: name, id: id ,type: type, required: required, validate: validate, raw: fields[i]});
      }
      if(currentGroup.length>0) {
        formHtml += renderFormRow(currentGroup);
        currentGroup=[];
      }
      formHtml += "</form>\n";

      if( functionList.length>0 || actions.length>0 || validationList.length>0 ) {
        var script = "\nself.processForm = function() { try{ ";
        for(var f in functionList) {
          script += "  \n    " + functionList[f] + "();\n";
        }

        for(var p in preValidationList) {
          script += "  \n    " + preValidationList[p] + "";
        }

        for(var v in validationList) {
          script += "  \n    " + validationList[v] + "";
        }

        script += "\n } catch(e) { console.log(e); } };\n";

        var setOutput = "";
        var setInput = "";
        var selfVars = "";
        var intVars = ""; //internal variables
        var listeners = "";
        for(var w in watchList) {
          if( typeof watchList[w] == "undefined" || watchList[w].trim().length==0) continue;

          var localName = watchList[w].after( formName + "." );
          setOutput += "    self." + localName + " = " + localName + ";\n";
          setInput += "    " + localName + " = self." + localName + ";\n";
          intVars += "var " +  localName + " = \"\";\n";
          selfVars += "self." +  localName + " = \"\";\n";
          listeners += "  try{ OpenForum.addListener( '" + watchList[w] + "' , " + formName + ".processForm ); } catch(e) { console.log(e); };\n";
        }

        for(var a in actions) {
          script += "\nself." + actions[a].after( formName + "." ) + " = function() {\n//Implement Action Here\n};\n";
        }


        var fns = formScript;
        formScript = formName + " = new function() {\nvar self = this;\n";
        formScript += intVars;
        formScript += selfVars;
        formScript += "\nvar setInput = function() {\n" + setInput + "\n};\n";
        formScript += "\nvar setOutput = function() {\n" + setOutput + "\n};\n";
        formScript += fns;
        formScript += script;
        formScript += "};\n\n";

        formScript += listeners;
      }

      var form = { formName: formName, script: formScript, html: formHtml, variables: watchList, functions: functionList, actions: actions };

      return form;
    } catch(e) {
      console.log(e);
      throw e;
    }
  };
};

if( typeof OpenForum == "undefined" ) {
  OpenForum = {};  
}

OpenForum.FormBuilder = new FormBuilder();
