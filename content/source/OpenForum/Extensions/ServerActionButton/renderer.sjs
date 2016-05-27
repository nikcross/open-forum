action = extension.getAttribute("action");
parameters = extension.getAttribute("parameters");
text = extension.getAttribute("text");

return "<a class=\"button\" href=\"#\" onclick=\"ajax.doGet('/OpenForum/Actions/"+action+"','"+parameters+"');return false;\">"+text+"</a>";
