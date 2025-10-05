var targetPage = extension.getAttribute("pageName");
if(targetPage===null) {
  targetPage = pageName;
}
targetPage = ""+targetPage;
var newTab = extension.getAttribute("newTab");
if(newTab=="true") {
  newTab = true;
} else {
  newTab = false;
}

list = file.getAttachmentsForPage( targetPage );
if(targetPage.charAt(0)!='/') {
  targetPage = "/"+targetPage;
}

var pagesList = [];
iterator= list.keySet().iterator();
while(iterator.hasNext()) {
  var key = ""+iterator.next();
  if(key.charAt(0)!='+' || key=="+history") {
    continue;
  } else {
    pagesList.push( key.substring(1) );
  }
}
pagesList.sort();

var data = "";
for(var i in pagesList) {
  var item = pagesList[i];
  if(newTab) {
  	data+="* ["+item+"|"+targetPage+"/"+item+"=]\n";
  } else {
  	data+="* ["+item+"|"+targetPage+"/"+item+"]\n";
  }
}

return js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs").render(pageName,data);