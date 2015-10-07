targetPage = extension.getAttribute("pageName");
matching = extension.getAttribute("matching");
includePage = true;
if(targetPage==null)
{
  targetPage = pageName;
  includePage = false;
}
targetPage = new String(targetPage);

list = file.getAttachmentsForPage( targetPage );
if(targetPage.charAt(0)!='/')
{
  targetPage = "/"+targetPage;
}

data="";
iterator= list.keySet().iterator();
while(iterator.hasNext())
{
  key = new String(iterator.next());
  if(key.charAt(0)=='+')
  {
    continue;
  }
  else if(matching!=null && key.search( new String(matching) )==-1 )
  {
    continue;
  }
  else
  {
    item = key;
  }

  if(includePage==true)
  {
    data+="* ["+targetPage+"/"+item+"]\n";
  }
  else
  {
    data+="* ["+item+"]\n";
  }

}

return wiki.renderWikiData(pageName,data);