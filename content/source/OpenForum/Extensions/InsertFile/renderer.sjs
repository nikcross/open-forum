var sourcePageName = extension.getAttribute("pageName");
if(sourcePageName==null)
{
  sourcePageName = pageName;
}

var fileName = extension.getAttribute("fileName");

return file.getAttachment( sourcePageName,fileName );
