var name = extension.getAttribute( "name" );
var title = extension.getAttribute("title");

name = name.replace(" ","_");
if(title!=null) {
	return "<img src=\"/OpenForum/Images/icons/png/" +name+ ".png\" title=\"" +title+ "\">";
} else {
	return "<img src=\"/OpenForum/Images/icons/png/" +name+ ".png\">";
}