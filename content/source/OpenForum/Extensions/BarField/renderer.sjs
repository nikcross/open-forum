var title = extension.getAttribute("title");
var id = extension.getAttribute("id");
var value = extension.getAttribute("value");
var maxValue = extension.getAttribute("maxValue");
var width = extension.getAttribute("width");
var height = extension.getAttribute("height");
var barImage = extension.getAttribute("tile");
var suffix = extension.getAttribute("suffix");

if(title!=null && id!=null)
{

if(barImage==null)
{
  barImage = "/OpenForum/Extensions/BarField/yellow-bar.png";
}
if(suffix==null)
{
  suffix="";
}

data = "<table class=\"blog\"><tr><td>"+title+"</td><td height=\""+height+"\" width=\""+width+"\"";
data += "bgcolor=\"white\"><img id=\""+id+"Bar\" src=\""+barImage+"\" ";
data += "width=\"5\" height=\""+height+"\"><input type=\"hidden\" id=\""+id+"Field\"";
data += "name=\""+id+"Field\"></td><td><DIV id=\""+id+"Layer\"></DIV></td></tr></table>";
data += "<script>";
data += "includeLibrary(\"/OpenForum/Extensions/BarField/barField.js\");";
data += "includeInitFunction(\""+id+" = new BarField(\'"+id+"\',"+value+","+maxValue+","+width+",\'"+suffix+"\')\")";
data += "</script>"

return data;
}
else
{
 return "Invalid Tag. Missing title or id attribute.";
}
