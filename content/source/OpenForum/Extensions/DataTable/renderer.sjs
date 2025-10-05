/*
* Author: Admin 
* Description: 
*/
var data = extension.getAttribute("data");
var name = extension.getAttribute("name");
var actionList = extension.getAttribute("actions");
TableBuilder = js.getObject( "/OpenForum/Editor/Plugins/TableBuilder" , "TableBuilder.js" );

var actions = {};
if(actionList!=null) {
  actionList = actionList.split(","); 
  for(var a in actionList) {
    actions[actionList[a]] = true;
  }
}

var content = null;
try{
  content = TableBuilder.buildTable( data, name, actions );
} catch (e) {
  content = "" + e;
}

var html = "<div style='padding: 2em;'><div class='dataTable'> <div>" + content.html + "</div></div></div>" + "<script> OpenForum.loadCSS('/OpenForum/Extensions/DataTable/data-table.css');\n" + content.script + "</script>";

return html;