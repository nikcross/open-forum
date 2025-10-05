/*
* Author: Admin 
* Description: 
*/
var sourcePage = extension.getAttribute("pageName");
var sourceFile = extension.getAttribute("fileName");

var content = file.getAttachment( sourcePage, sourceFile );

return js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs").render(pageName,content);