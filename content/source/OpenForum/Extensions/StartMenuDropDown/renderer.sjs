var title = extension.getAttribute("title");

if(title!=null)
{
 title = new String(title);

 data =  "<td>  <img src=\"/OpenForum/Images/icons/gif/bullet_white.gif\" border=\"0\"></td><td>";
 data += "<table><tr><td class=\"menuBar\"><a href=\"\" onClick=\"toggleMenuLayer('"+title+"');return false;\" class=\"menuBar\">"+title+"</a>";
 data += "</td></tr><tr><td><DIV id=\""+title+"\" style=\"position: absolute; display: none;\">";
 data += "<table class=\"menuTop\"><tr><td><DIV id=\""+title+"InsertPoint\"></DIV>";

 return data;
}
else
{
  return "Invalid StartMenuDropDown. Missing title attribute.";
}
