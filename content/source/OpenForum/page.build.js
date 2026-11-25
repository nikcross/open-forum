/*
* Author: 
* Description: 
*/

var data = file.getAttachment("/OpenForum/Javascript/PageBuilder/","default-page-builder.js");
js.startJavascript("/OpenForum/Javascript/PageBuilder/default-page-builder.js",data);

var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");

var attachments=[];
//var pageName = "/Sandbox";
var matching = ".*\\.wiki\\.fragment"; //Regex include all wiki fragments

var list = file.getAttachmentsForPage( pageName );
if(pageName.charAt(0)!='/')
{
  pageName = "/"+pageName;
}

var iterator= list.keySet().iterator();
while(iterator.hasNext())
{
  var key = ""+iterator.next();
  var item;
  if(key.charAt(0)==='+') { // ignore sub pages
    continue;
  } else if(key.search( matching )==-1 ) {
    continue;
  } else {
    var name = key.substring(0,key.indexOf(".wiki.fragment"));
    var content = file.getAttachment(pageName,key);
    file.saveAttachment(pageName,name+".html.fragment",renderer.render(pageName,content));
  }
}
