var title = ""+extension.getAttribute("title");
var fn = ""+extension.getAttribute("function");

var id = extension.getAttribute("id");
if(id!=null) {
	return "<a id=\""+id+"\" class=\"button tiny\" onClick=\""+fn+"(); return false;\">"+title+"</a>";
} else {
	return "<a class=\"button tiny\" onClick=\""+fn+"(); return false;\">"+title+"</a>";
}