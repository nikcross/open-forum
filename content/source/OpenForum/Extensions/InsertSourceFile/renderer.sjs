var sourcePageName = extension.getAttribute("pageName");
if(sourcePageName==null)
{
  sourcePageName = pageName;
}

var fileName = extension.getAttribute("fileName");

data = file.getAttachment( sourcePageName,fileName );

editLink = "/OpenForum/Actions/EditText?pageName="+sourcePageName+"&fileName="+fileName;

pageData = "["+sourcePageName+"/"+fileName+"]<a href=\""+editLink+"\" title=\"Edit\"><img src=\"/OpenForum/Images/icons/gif/pencil.gif\" border=\"0\"></a>{{{$contents$}}}";
pageData = wiki.renderWikiData(pageName,pageData);
pageData = pageData.replace("$contents$",data);

return pageData;