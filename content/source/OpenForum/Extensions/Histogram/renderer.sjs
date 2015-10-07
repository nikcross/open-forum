width = extension.getAttribute("width");
height = new Number(extension.getAttribute("height"));

pageName = extension.getAttribute("pageName");
csvFileName = extension.getAttribute("csvFileName");
separator = extension.getAttribute("separator");
if(separator=="TAB")
{
  separator="\t";
}

dataColumn = new Number(extension.getAttribute("dataColumn"));
yAxisTitle = extension.getAttribute("yAxisTitle");
xAxisTitle = extension.getAttribute("xAxisTitle"); 

data = "<table border='0'><tr>";
data += "<td><b>"+yAxisTitle+"</b></td>";
data += "<td>";
data += "<table border='1'><tr><td>";
data += "<table height='"+height+"' width='"+width+"' cellpadding='1' cellspacing='0'>";

result = js.getApi("/OpenForum/JarManager/Spreadsheet").loadCSVAsXml(pageName,csvFileName,separator);

rows = result.getElementsByName("row");
maxValue = 0;
columnWidth = width/rows.size();

for(loop=0;loop<rows.size();loop++)
{
  value = new Number(rows.elementAt(loop).getElementByIndex( dataColumn ).getValue());

  if(value>maxValue)
  {
    maxValue = value;
  }
}

data+="<td>"+Math.round(maxValue)+"</td>"

for(loop=0;loop<rows.size();loop++)
{
  value = new Number(rows.elementAt(loop).getElementByIndex( dataColumn ).getValue());
  columnHeight = (value*height)/maxValue;

  data += "<td rowspan='10' valign='bottom'><a href='' onclick='return false;' title='"+value+" "+yAxisTitle+"'><img src='/OpenForum/Images/area.png' width='"+columnWidth+"' height='"+columnHeight+"'/></td>";
}

data+="</tr>";

for(loop=1;loop<10;loop++)
{
  data+="<tr><td>"+Math.round((maxValue/10)*(10-loop))+"<td></tr>"
}

data += "</table>";
data += "</td></tr></table>";
data += "</td></tr>";
data += "<tr><td colspan='2' align='center'><b>"+xAxisTitle+"</b></td></tr>";
data += "</table>";

return data;