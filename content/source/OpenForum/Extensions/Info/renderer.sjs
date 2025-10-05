/*
* Author: 
* Description: 
*/
var id = extension.getAttribute("id");
var sourceFile = extension.getAttribute("sourceFileName");
var sourcePage = extension.getAttribute("sourcePageName");
var title = extension.getAttribute("title");

var html = "";

if(sourceFile!=null) {
var content = openForum.renderWikiData(sourcePage,file.getAttachment(sourcePage,sourceFile));
html = "<div id=\""+id+"\" class=\"reveal-modal\" data-reveal aria-labelledby=\""+id+"ModalTitle\" aria-hidden=\"true\" role=\"dialog\">" + 
    content+
	"  <a class=\"close-reveal-modal\" aria-label=\"Close\">&#215;</a>" + 
    "</div>";
} else {
  html = "<a onClick=\"$('#"+id+"').foundation('reveal', 'open');return false;\" title=\""+title+"\"><img src=\"/OpenForum/Images/icons/png/information.png\" /></a>";
}

return html;