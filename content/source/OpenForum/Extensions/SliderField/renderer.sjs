var title = extension.getAttribute("title");
var id = extension.getAttribute("id");
var value = extension.getAttribute("value");
var maxValue = extension.getAttribute("maxValue");
var width = extension.getAttribute("width");
var height = extension.getAttribute("height");

if(title!=null && id!=null)
{
var realWidth = Number(width)+25;

data = "<table class=\"blog\"><tr>";
data += "<td>"+title+"</td>";
data += "<td height=\""+height+"\" width=\""+realWidth+"\"bgcolor=\"white\"><DIV id=\""+id+"ControlLayer\"><img id=\""+id+"Slider\" src=\"/OpenForum/Images/area.png\" width=\"20\" height=\""+height+"\"><a href=\"\" onMouseDown=\"mouse.setSelected("+id+");return false;\" onClick=\"mouse.setSelected("+id+");return false;\"><img id=\""+id+"Control\" src=\"/OpenForum/Extensions/SliderField/slider.png\" width=\"20\" height=\""+height+"\" border=\"0\"></a></DIV><input type=\"hidden\" id=\""+id+"\"name=\""+id+"\"></td>";
data += "<td><DIV id=\""+id+"Layer\"></DIV></td>";
data += "</tr></table>";
data += "<script>includeLibrary(\"/OpenForum/Extensions/SliderField/slider.js\");includeInitFunction(\""+id+" = new SliderField('"+id+"',"+value+","+maxValue+","+width+")\")</script>";
 return data;
}
else
{
 return "Invalid Tag. Missing title or id attribute.";
}
