var title = extension.getAttribute("title");
var id = extension.getAttribute("id");

if(title!=null && id!=null)
{
 title = new String(title);
 id = new String(title);

data = "<table class=\"blog\" width=\"100%\"><tr><td><a href=\"\" onclick=\"ui.toggleLayer(\'"+id+"\');return false;\"><img id=\""+id+"Twisty\" src=\"/OpenForum/Images/icons/gif/bullet_arrow_down.gif\" border=\"0\"/>"+title+"</a>";
data += "<DIV id=\""+id+"\" style=\"display: none;\" width=\"100%\">";

 return data;
}
else
{
 return "Invalid Menu. Missing title, id or options attribute.";
}
