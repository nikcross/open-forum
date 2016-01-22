var sourcePageName = extension.getAttribute("pageName");
if(sourcePageName===null) {
  sourcePageName = pageName;
}

var fileName = extension.getAttribute("fileName");
var data = ""+file.getAttachment( sourcePageName,fileName );
data = data.replace(/xmp/g,"(xmp)");
var editLink = "/OpenForum/Editor?pageName="+sourcePageName+"&fileName="+fileName;

pageData = "[/"+sourcePageName+"/"+fileName+"]<a href=\""+editLink+"\" title=\"Edit\"><img src=\"/OpenForum/Images/icons/gif/pencil.gif\" border=\"0\"></a><xmp class=\"panel\">$contents$</xmp>";
pageData = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs").render(pageName,pageData);
pageData = pageData.replace("$contents$",data);

return pageData;