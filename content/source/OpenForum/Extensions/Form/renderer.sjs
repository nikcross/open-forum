/*
* Author: Admin 
* Description: 
*/
var data = extension.getAttribute("data");
var name = extension.getAttribute("name");

var fileName = extension.getAttribute("fileName");
if(fileName != null) {
  var sourcePageName = extension.getAttribute("pageName");
  if(sourcePageName!=null) {
    pageName = sourcePageName;
  }
  data = ""+file.getAttachment(pageName,fileName);
}


TableBuilder = js.getObject( "/OpenForum/Editor/Plugins/TableBuilder" , "TableBuilder.js" );
FormBuilder = js.getObject( "/OpenForum/Editor/Plugins/FormBuilder" , "FormBuilder.js" );
FormBuilder.setTableBuilder( TableBuilder );

var content = null;
try{
  content = FormBuilder.buildForm( data, name );
  content.script = content.script.replace( new RegExp("self","g") , name );
  content.script = name + " = {};" + content.script; 
} catch (e) {
  return "" + e;
}

var html = content.html + "<script>" + content.script + "</script>";

return html;