var title = extension.getAttribute("title");
var items = extension.getAttribute("options");

if(title!=null & items!=null)
{
 title = new String(title);
 items = new String(items).split(",");

 data =  "<td><img src=\"/OpenForum/Images/icons/gif/bullet_white.gif\" border=\"0\"></td><td>";
 data += "<table><tr><td class=\"menuBar\"><a href=\"\" onClick=\"toggleMenuLayer('"+title+"');return false;\" class=\"menuBar\">"+title+"</a>";
 data += "</td></tr><tr><td><DIV id=\""+title+"\" style=\"position: absolute; display: none;\">";
 data += "<table class=\"menuTop\"><tr><td>";

 for(itemNo = 0;itemNo<items.length ;itemNo++ )
 {

 itemParts = items[itemNo].split("|");
 if(itemParts.length==3)
 {
  data += "<a class=\"menuItem\" href=\""+itemParts[1]+"\"><img src=\""+itemParts[0]+"\" class=\"NodeImg\" border=\"0\">    "+itemParts[1]+"</a></br>";
 }
 else if(itemParts.length==2)
 {
  data += "<a class=\"menuItem\" href=\""+itemParts[1]+"\"> "+itemParts[0]+"</a>";
 }
 else
 {
  data += "<a class=\"menuItem\" href=\""+items[itemNo]+"\">"+items[itemNo]+"</a>";
 }
 }
 data += "</td></tr></table></DIV></td></tr></table></td><td> </td>";

 return data;
}
else
{
  return "Invalid Menu. Missing title or options attribute given.";
}
