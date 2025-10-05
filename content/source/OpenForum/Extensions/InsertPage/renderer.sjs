var page = ""+extension.getAttribute("page");
var section = extension.getAttribute("section");

var content = ""+file.getAttachment(page,"page.content");

if(section!=null && section!="") {
  section = parseInt("" + section);
  var sections = content.split("--8<--");
  
  if(section>=sections.length) return "";
  
  content = sections[section];
  content = content.substring(0,content.indexOf("-->8--"));
  
  return "" + openForum.renderWikiData(page,content);
} else {
  return "" + openForum.renderWikiData(page,content);
}
