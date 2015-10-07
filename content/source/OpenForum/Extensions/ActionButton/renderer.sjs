action = extension.getAttribute("action");
parameters = extension.getAttribute("parameters");
text = extension.getAttribute("text");

return "<input type=\"button\" value=\""+text+"\" onclick=\"ajax.doGet('/OpenForum/Actions/"+action+"','"+parameters+"');return false;\">";