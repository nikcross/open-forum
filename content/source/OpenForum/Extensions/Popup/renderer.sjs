/*
* Author: 
* Description: 
*/
var id = extension.getAttribute("id");
var sourceFile = extension.getAttribute("sourceFileName");
var sourcePage = extension.getAttribute("sourcePageName");
var content = extension.getAttribute("content");
var title = extension.getAttribute("title");
var action = extension.getAttribute("action");

var html = "";

if(sourceFile!=null || content!=null) {
  if(content==null) {
    var content = openForum.renderWikiData(sourcePage,file.getAttachment(sourcePage,sourceFile));
  } 

  html = "<div id=\""+id+"\" class=\"reveal-modal\" data-reveal aria-labelledby=\""+id+"ModalTitle\" aria-hidden=\"true\" role=\"dialog\">" + 
    content+
    "  <a class=\"close-reveal-modal\" aria-label=\"Close\">&#215;</a>" + 
    "</div>";
} if(content!=null) {
} else {
  if(action==null) {
    action="";
  }
  
  html = "<a class='button small round' onClick=\"$('#"+id+"').foundation('reveal', 'open');"+action+";return false;\">"+title+"</a>";
}

return html;