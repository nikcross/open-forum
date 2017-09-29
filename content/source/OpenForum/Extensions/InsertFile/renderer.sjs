var sourcePageName = extension.getAttribute("pageName");
if(sourcePageName==null)
{
  sourcePageName = pageName;
}

var fileName = extension.getAttribute("fileName");

var data = ""+file.getAttachment( sourcePageName,fileName );
var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");
data = renderer.render(pageName,data)

return data;