/*
* Author: Admin 
* Description: 
*/
var data = extension.getAttribute("data");
var name = extension.getAttribute("name");
var actionList = extension.getAttribute("actions");
TableBuilder = js.getObject( "/OpenForum/Editor/Plugins/TableBuilder" , "TableBuilder.js" );

var fileName = extension.getAttribute("fileName");
if(fileName != null) {
  var sourcePageName = extension.getAttribute("pageName");
  if(sourcePageName!=null) {
    pageName = sourcePageName;
  }
  data = ""+file.getAttachment(pageName,fileName);
}

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
  return "" + e;
}

var html = content.html + "<script>" + content.script + "</script>";

return html;