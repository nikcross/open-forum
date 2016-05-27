/*
* Author: 
* Description: 
*/
try{
  
var markDownText = "";

var url = extension.getAttribute("url");
if( typeof(url)!="undefined" ) {
  markDownText = ""+external.getURLAsString(url);
} else {
	var pageName = extension.getAttribute("pageName");
	var fileName = extension.getAttribute("fileName");
  
  markDownText = ""+file.getAttachment(pageName,fileName);
}

var mdScript = ""+file.getAttachment("/OpenForum/Extensions/MarkDown","marked.js");
eval(mdScript);

return marked( markDownText );
  
} catch (e) {
  return ""+e;
}