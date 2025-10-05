var targetPage = extension.getAttribute("pageName");
if(targetPage===null) {
  targetPage = pageName;
}
targetPage = ""+targetPage;

var content = "<div class=\"row\">\n";
var matching = ".*"; //Regex include all

var list = file.getAttachmentsForPage( targetPage );

var iterator= list.keySet().iterator();
var keys = [];
while(iterator.hasNext()) {
  keys.push( ""+iterator.next() );
}
keys.sort();

for(var i in keys) {
  var key = keys[i];
  if(key.charAt(0)==='+') { // process sub pages
    var addOnPageName = "" + key.substring(1);
    if(addOnPageName=="history") continue;

    var contentPageName = addOnPageName;
    var hasQuickReference = false;
    if( file.attachmentExists( targetPage + "/" + addOnPageName + "/QuickReference", "page.content" ) ) {
      contentPageName = addOnPageName + "/QuickReference";
      hasQuickReference = true;
    }


    content += "\n\n----\n\n !! [" + addOnPageName + "|" + targetPage + "/" + addOnPageName + "] \n\n";
    content += " [{InsertPage page=\"" + targetPage + "/" + contentPageName + "\" section=\"1\"}]<br />\n";
    if(hasQuickReference) {
      content += " [{Popup id=\"QR_"+addOnPageName+"\" sourceFileName=\"page.html.fragment\" sourcePageName=\"" + targetPage + "/" + contentPageName + "\"}]<br />\n";
      content += " [{Popup id=\"QR_"+addOnPageName+"\" title=\"Quick Reference\"}] ";
      content += "__[Open in a new tab|" + targetPage + "/" + contentPageName + "]__<br />\n";
    }
  }
}
content += "\n</div>";

return js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs").render(pageName,content);
