/*
* Author: Admin 
* Description: 
*/
name = extension.getAttribute("name");
value = extension.getAttribute("value");

if(value==null) {
  value="{{"+name+"}}";
}

var template = ""+file.getAttachment( "/OpenForum/Extensions/WysiwygInput","wysiwyg-input.html.template" );

var html = template.replaceAll("{{name}}",name).replaceAll("{{value}}",value);

return html;