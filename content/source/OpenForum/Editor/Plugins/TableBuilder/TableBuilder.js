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

var TableBuilder = function() {
  var self = this;

  var renderTable = function(tableName, rowsDefinition, actions) {
    var columns = rowsDefinition.split("\n");

    for(var i=0; i<columns.length ;i++) {
      if( columns[i].startsWith("#") ) {
        var line = columns[i].after("#");
        if( line.startsWith("Action.") ) {
          actions[ line.after("Action.") ] = true;
        }
      }
    }
    
    var thead = "<thead>\n    <tr>\n";
    var tbody = "<tbody>\n    <tr of-repeatFor='row in "+tableName+"'>\n";
    var html = "";
	var columnCount = columns.length;
    
    for(var i=0; i<columns.length ;i++) {
      if( columns[i].startsWith("#") ) {
        continue;
      }
      var row = columns[i].split(/\s/);
      if(row[0].length===0) continue;
      var name = row[0].replace(/_/g," ");
      var dataName = name;
      var type = "text";
      if(row.length>1) dataName = row[1];
      if(row.length>2) type = row[2];

      if(type==="action") {
        thead += "        <td>&nbsp;</td>\n";
      } else {
        thead += "        <td>" + name + "</td>\n";
      }

      tbody += "        <td>";

      var viewStyle = "";
      if(actions.edit) {
        viewStyle = " style='{{row.view}}'";
      }
      if(type==="action") {
        tbody += "<a class='button tiny round' href='#' onClick='"+dataName+"(" + tableName + ",{{row.index}}); return false;'>" + name +  "</a>";
      } else {
        if(type==="link") {
          tbody += "<span" + viewStyle + "><a href='{{row."+dataName+"}}'>{{row."+dataName+"}}</a></span>";
        } else {
          tbody += "<span" + viewStyle + ">{{row."+dataName+"}}</span>";
        }

        if(actions.edit) {
        	tbody += "<span style='{{row.edit}}'><input type='text' value='{{row."+dataName+"}}' onChange='OpenForum.Table.setCell(" + tableName + ",{{row.index}},\"" + dataName + "\",this.value);'/></span>";
        }
      }
      tbody += "</td>\n";
    }
    thead += "        <td>&nbsp;</td>\n";
    var actionsHtml = "";
    
    if(actions.edit) {
      actionsHtml += "        <a class='button tiny' onClick='OpenForum.Table.editRow(" + tableName + ",{{row.index}}); return false;'>Edit</a>\n";
    }

    if(actions.move) {
      actionsHtml += "        <a class='button tiny' onClick='OpenForum.Table.moveRowUp(" + tableName + ",{{row.index}}); return false;'>Move Up</a>\n";
      actionsHtml += "        <a class='button tiny' onClick='OpenForum.Table.moveRowDown(" + tableName + ",{{row.index}}); return false;'>Move Down</a>\n";
    }
    if(actions.remove) {
      actionsHtml += "        <a class='button tiny' onClick='OpenForum.Table.removeRow(" + tableName + ",{{row.index}}); return false;'>Remove</a>\n";
    }
    if(actionsHtml.length>0) {
   		columnCount ++;
    	tbody += "<td>" + actionsHtml + "</td>";
    }

    html = "<table>\n"+thead+"   </tr>\n</thead>\n"+tbody+
      "    </tr>\n</tbody>\n<tfoot>\n<tr><td colspan=\""+(columnCount+1)+"\">";
    if(actions.add) {
      html += "<a href=\"#\" onClick=\"OpenForum.Table.addRow("+tableName+","+tableName+"_rowTemplate); return false;\" class=\"button tiny round\">Add Row</a>\n";
    }
    if(actions.save) {
      html += "<a href=\"#\" onClick=\"OpenForum.Table.closeTable("+tableName+"); OpenForum.saveJSON('your page name/"+tableName+".json',"+tableName+"); return false;\" class=\"button tiny round\">Save Changes</a>";
    }
    html += "</td></tr></tfoot>\n</table>";
    
    return html;
  };

  var renderScript = function(tableName, rowsDefinition, actions) {
        var columns = rowsDefinition.split("\n");

    var json = { tableName: tableName, rowsDefinition: rowsDefinition, actions: actions };
    var jsonRow = {};

    for(var i=0; i<columns.length ;i++) {
      var row = columns[i].split(/\s/);
      if(row[0].length===0) continue;
      var name = row[0].replace(/_/g," ");
      var dataName = name;
      var type = "text";
      if(row.length>1) dataName = row[1];
      if(row.length>2) type = row[2];
      

      json[dataName]={name: name, dataName: dataName, type: type};
      jsonRow[dataName] = "";
    }
    
    var script = "//=========\n\n";

    script+= tableName + "tableDefinition = {\columns: "+JSON.stringify(json,null,4)+",\nrows: [\n" + JSON.stringify(jsonRow,null,4) + "\n]};";

    script+= "\n\n//=========\n\n";

    script+= "" + tableName + "=[];\n";
    script+= tableName + "_rowTemplate = " + JSON.stringify(jsonRow) + ";\n";
    script+= "OpenForum.Table.addRow("+tableName+","+tableName+"_rowTemplate);\n";
    script+= "//OpenForum.loadJSON(\"your page/"+tableName+".json\",function(json){ "+tableName+"=json; });\n";

    script+= "\n\n//=========\n\n";

	return script;
  };

  var renderShortScript = function(tableName, rowsDefinition, actions) {
        var columns = rowsDefinition.split("\n");

    var json = { tableName: tableName, rowsDefinition: rowsDefinition, actions: actions };
    var jsonRow = {};

    for(var i=0; i<columns.length ;i++) {
      var row = columns[i].split(/\s/);
      if(row[0].length===0) continue;
      var name = row[0].replace(/_/g," ");
      var dataName = name;
      var type = "text";
      if(row.length>1) dataName = row[1];
      if(row.length>2) type = row[2];

      json[dataName]={name: name, dataName: dataName, type: type};
      jsonRow[dataName] = "";
    }
    
    var script = "" + tableName+ "=[];\n";
    script += tableName + "_rowTemplate = " + JSON.stringify(jsonRow) + ";\n";

	return script;
  };
  
  self.buildTable = function( tableDefinition, tableName, actions ) {

    var tableScript;
    var tableHtml;
    var html;
    var watchList = [];
    var functionList = [];
    var rowsDefinition;
    
    if( typeof tableName == "undefined" || tableName == "" ) {
      tableName = "theTable";
    }
    if( tableDefinition.before("\n").contains("Table Name:") ) {
      tableName = tableDefinition.between("Table Name:","\n").trim();
      tableDefinition = tableDefinition.after("\n").trim();
    }
    
    if( typeof actions == "undefined" ) {
      actions = {};
    }

    try{
     rowsDefinition = tableDefinition;
	 tableHtml = renderTable( tableName, rowsDefinition, actions );
	 tableScript = renderScript( tableName, rowsDefinition, actions );
	 var tableShortScript = renderShortScript( tableName, rowsDefinition, actions );

      var table = { tableName: tableName, script: tableScript,shortScript: tableShortScript, html: tableHtml, variables: watchList, functions: functionList, actions: actions };

      return table;
    } catch(e) {
      console.log(e);
      throw e;
    }
  };
};

if( typeof OpenForum == "undefined" ) {
  OpenForum = {};  
}

OpenForum.TableBuilder = new TableBuilder();
