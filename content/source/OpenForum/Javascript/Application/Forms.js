/*
* Author: 
* Description: 
*/

var Forms = new function() {
  var self = this;

  var buttonTemplate = "<a href='#' class='button tiny' onclick='{{fnName}}(); return false;'>{{title}}</a>";

  var addListener = function(id,callBack) {
    OpenForum.getObject(id).addListener( manageCommandJS );
  };

  self.button = function(title,fnName) {
    return buttonTemplate.replaceAll("{{title}}",title).replaceAll("{{fnName}}",fnName);
  };

  self.textField = function(title,id,changeCallBack) {
    if(changeCallBack) {
      addListener(id,changeCallBack);
    }

    //var value = OpenForum.evaluate(id);
    return title + ": <input type='text' of-id='"+id+"' value='{{"+id+"}}'/>";
  };

  self.booleanField = function(title,id,changeCallBack) {
    if(changeCallBack) {
      addListener(id,changeCallBack);
    }

    var value = OpenForum.evaluate(id);
    var field = "<label for='"+title+"CheckBox'>" + title + "</label>" +
        "<div class='switch'>" +
        "<input of-id='"+id+"' id='"+title+"CheckBox' type='checkbox'";

    if(value==true) field += " checked";

    field += ">" +
      "<label for='"+title+"CheckBox'></label>" +
      "</div>";

    return field;
  };

  self.table = function(tableName,table,columns,actions) {
    if(!table.length) throw "table must be an array.";
    if(table.length==0) throw "table must have a row.";
    
    OpenForum.Table.closeTable(table);

    var fields = [""];
    if(typeof table[0] == "object") {
      fields = Object.keys(table[0]);
    }

    var json = {};
    var jsonRow = {};
    var thead = "<thead>\n    <tr>\n";
    var tbody = "<tbody>\n    <tr of-repeatFor='row in "+tableName+"'>\n";

    for(var i=0; i<fields.length ;i++) {
      var name = fields[i];
      if(columns && columns[i]) {
        name = columns[i];
      }

      var dataName = fields[i];
      var type = "text";

      if(fields[i].length>0) {
        if(typeof table[0][fields[i]] == "function") {
          type="action";
        } else if( table[0][fields[i]].indexOf("http")==0 ) {
          type="link";
        }
      }

      if(type==="action") {
        thead += "        <td>&nbsp;</td>\n";
      } else {
        thead += "        <td>" + name + "</td>\n";
      }

      tbody += "        <td>";

      if(type==="action") {
        tbody += "<a class='button tiny round' href='#' onClick='"+dataName+"(" + table + ",{{row.index}}); return false;'>{{row.name}}</a>";
      } else {
        var dataId = "row."+dataName;
        if(dataName=="") {
          dataId = "row";
        }
        if(type==="link") {
          tbody += "<span style='{{row.view}}'><a href='{{" + dataId + "}}'>{{" + dataId + "}}</a></span>";
        } else {
          tbody += "<span style='{{row.view}}'>{{" + dataId + "}}</span>";
        }

        tbody += "<span style='{{row.edit}}'>"+
          "<input type='text' value='{{" + dataId + "}}' "+
          "onChange='OpenForum.Table.setCell(" + tableName + ",{{row.index}},\"" + dataName + "\",this.value);"+
          "'/></span>";
      }
      tbody += "</td>\n";
    }
    thead += "        <td>&nbsp;</td>\n";
    tbody += "        <td>";
    if(actions.includes("edit")) {
      tbody +="<a class='button tiny' onClick='OpenForum.Table.editRow(" + tableName + ",{{row.index}}); return false;'>Edit</a>";
    }
    if(actions.includes("delete")) {
      tbody +="<a class='button tiny' onClick='OpenForum.Table.removeRow(" + tableName + ",{{row.index}}); return false;'>Delete</a>";
    }
    tbody +="</td>";

    var tableView = "<table>\n"+thead+"   </tr>\n</thead>\n"+tbody+"    </tr>\n</tbody>\n</table>";
    if(actions.includes("add")) {
      tableView += "<a class='button tiny' onClick='OpenForum.Table.addRow(" + tableName + "); return false;'>Delete</a>";
    }

    return tableView;
  };
};