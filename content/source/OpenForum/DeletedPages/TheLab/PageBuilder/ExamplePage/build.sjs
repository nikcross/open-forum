var content = file.getAttachment("content.html");
var pageHtml = wiki.buildPage(content);
file.saveAttachment("page.html",pageHtml);

