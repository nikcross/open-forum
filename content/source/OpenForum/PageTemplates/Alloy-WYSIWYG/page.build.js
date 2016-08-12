/*
* Author: 
* Description: 
*/

var html = ""+file.getAttachment(pageName,"page.content");
file.saveAttachment(pageName,"page.html",html);

page = html;