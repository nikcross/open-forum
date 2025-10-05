try{
  
targetPage = extension.getAttribute("pageName");
matching = extension.getAttribute("matching");
actions = extension.getAttribute("actions");
includePage = true;
if(targetPage===null)
{
  targetPage = pageName;
  includePage = false;
}
targetPage = ""+targetPage;

if(targetPage.charAt(0)!='/')
{
  targetPage = "/"+targetPage;
}

list = file.getAttachmentsForPage( targetPage );

data="";
iterator= list.keySet().iterator();
while(iterator.hasNext())
{
  key = ""+iterator.next();
  if(key.charAt(0)=='+')
  {
    continue;
  }
  else if(matching!==null && key.search( ""+matching )==-1 )
  {
    continue;
  }
  else
  {
    item = key;
  }

  var actionsText = "";
  if(actions!=null) {
    var link = targetPage+"/"+item;
    actionsText = actions.replace("{{pageName}}",targetPage).replace("{{fileName}}",item);
  }
  
  if(includePage===true)
  {
    data+="* ["+targetPage+"/"+item+"]"+actionsText+"\n";
  }
  else
  {
    data+="* ["+item+"]"+actionsText+"\n";
  }

}

return wiki.renderWikiData(pageName,data);
} catch(e) {
  return ""+e;
}