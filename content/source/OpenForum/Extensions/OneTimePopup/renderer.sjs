/*
* Author: 
* Description: 
*/
var id = extension.getAttribute("id");
var sourceFile = extension.getAttribute("sourceFileName");
var sourcePage = extension.getAttribute("sourcePageName");
var suppressText = extension.getAttribute("suppressText");

var content = openForum.renderWikiData(sourcePage,file.getAttachment(sourcePage,sourceFile));

var html = "<div id=\""+id+"\" class=\"reveal-modal\" data-reveal aria-labelledby=\""+id+"ModalTitle\" aria-hidden=\"true\" role=\"dialog\">" + 
    content;
    if(suppressText!=null) {
		html += " <a class=\"button tiny round\" onClick=\"document.cookie='"+id+"Hide=true'; $('#"+id+"').foundation('reveal', 'close'); return false;\">"+suppressText+"</a>";
    }
    html += "  <a class=\"close-reveal-modal\" aria-label=\"Close\">&#215;</a>" + 
    "</div>"+
    "<script>";


    if(suppressText!==null) html += "if(OpenForum.getCookie('"+id+"Hide')==null) {";
    html += "window.addEventListener('load',"+
    "function() {$('#"+id+"').foundation('reveal', 'open'); }"+
    ");";
    if(suppressText!==null) html += "}";
	html += "</script>";

return html;