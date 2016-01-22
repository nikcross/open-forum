var title = ""+extension.getAttribute("title");
var fn = ""+extension.getAttribute("function");

return "<a class=\"button tiny\" onClick=\""+fn+"(); return false;\">"+title+"</a>";