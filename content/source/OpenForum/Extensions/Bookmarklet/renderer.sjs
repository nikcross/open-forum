try{
domain = extension.getAttribute("domain");
title = extension.getAttribute("title");
script = extension.getAttribute("script");
text = extension.getAttribute("text");

var script = file.getAttachment( "",script ).replaceAll("\"","\\\\\"");
script = script.replaceAll("\\{\\{domain\\}\\}",domain);
script = script.replaceAll("\\{\\{pageName\\}\\}",pageName);
var bmHref = "javascript: " + script;

return text + "<a class='button tiny round success' href=\"" + bmHref + "\">" + title + "</a>";
} catch(e) {
  return e;
}