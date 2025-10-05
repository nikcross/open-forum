var sourcePageName = extension.getAttribute("pageName");
if(sourcePageName==null) {
  sourcePageName = pageName;
}

var fileName = extension.getAttribute("fileName");
if(fileName==null) {
  fileName = "notes.txt";
}

var data = ""+file.getAttachment( sourcePageName,fileName );
data = data.replace(/xmp/g,"(xmp)");
var editLink = "/TheLab/Tools/Notes?pageName="+sourcePageName+"&fileName="+fileName;

pageData = "<a href=\""+editLink+"\" title=\"Edit\" target=\"notepad\">"+sourcePageName+"/"+fileName+"<img src=\"/OpenForum/Images/icons/gif/pencil.gif\" border=\"0\"></a><xmp class=\"panel\">$contents$</xmp>";
pageData = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs").render(pageName,pageData);
pageData = pageData.replace("$contents$",data);

return pageData;