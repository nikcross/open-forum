var title = extension.getAttribute("title");
var id = extension.getAttribute("id");
var items = extension.getAttribute("options");

if(title!=null && items!=null && id!=null)
{
 title = new String(title);
 id = new String(title);
 items = new String(items).split(",");

data = "<ul><li><a href=\"\" onclick=\"ui.toggleLayer(\'"+id+"\');return false;\"><img id=\""+id+"Twisty\" src=\"/OpenForum/Images/icons/gif/bullet_arrow_down.gif\" border=\"0\"/>"+title+"</a></li></ul>";
data += "<DIV id=\""+id+"\" style=\"display: none;\" width=\"200\">";
data += "<ul><li>";

 for(itemNo = 0;itemNo<items.length ;itemNo++ )
 {

 itemParts = items[itemNo].split("|");
 if(itemParts.length==3)
 {
 link = "<a class=\"menuItem\" href=\""+itemParts[1]+"\"><img src=\""+itemParts[0]+"\" class=\"NodeImg\" border=\"0\">"+itemParts[1]+"</a></br>";
 }
 else if(itemParts.length==2)
 {
 link = "<a class=\"menuItem\" href=\""+itemParts[1]+"\">"+itemParts[0]+"</a>";
 }
 else
 {
 link = "<a class=\"menuItem\" href=\"/"+items[itemNo]+"\">"+items[itemNo]+"</a>";
 }

data += "  <ul><li>"+link+"</li></ul>";

 }

data += "</li></ul>";
data += "</DIV>";

 return data;
}
else
{
 return "Invalid Menu. Missing title, id or options attribute.";
}
