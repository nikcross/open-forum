/*
* Author: 
* Description: 
*/
var id = extension.getAttribute("id");

var html = ""+ file.getAttachment("/OpenForum/Extensions/InputFileName","renderer.template.html");
html = html.replace(/&id;/g,id);

return html;