/*
* Author: Nik Cross
* Description: Just copies page.content to page.html
*/
var html = ""+file.getAttachment(pageName,"page.content");
file.saveAttachment(pageName,"page.html",html);

page = html;

