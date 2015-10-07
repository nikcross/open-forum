targetPageName = extension.getAttribute("pageName");
if(targetPageName ==null)
{
  targetPageName = "/"+pageName;
}
name = extension.getAttribute("name");
text = extension.getAttribute("text");

return "<a href=\""+targetPageName+"#"+name+"\">"+text+"</a>";