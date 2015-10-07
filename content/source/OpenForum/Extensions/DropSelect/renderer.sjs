options = extension.getAttribute("options");
name = extension.getAttribute("name");
action = extension.getAttribute("action");
value = extension.getAttribute("value");

if(value==null)
{
  value="&"+name+";";
}
if(action==null)
{
  action="";
}

//cast to JS strings
value = new String(value);
options = new String(options);
reference = null;

if(options.charAt(0)=='/')
{
 reference = options;
 optionsArray = wiki.getPageAsList(options); 
 // cast Java Strings to JS Strings
 options = new Array();
 for(loop=0;loop<optionsArray.length;loop++)
 {
    options[loop] = new String(optionsArray[loop][0]);
 }
}
else
{
 options = new String(options).split(",");
}

data = "<select name='_"+name+"' id='_"+name+"'";
data += " onChange='document.getElementById(\""+name+"\").value";
data += "=document.getElementById(\"_"+name+"\").";
data += "options[document.getElementById(\"_"+name+"\").";
data += "selectedIndex].value;";
data += action.replace("\"","\\\"");
data += " return false;'>";

for(loop=0;loop<options.length;loop++)
{
  if(value.charAt(0)!='&' && value==options[loop])
  {
    data += "  <option selected value='"+options[loop]+"'>"+options[loop]+"</option>\n";
  }
  else
  {
    data += "  <option value='"+options[loop]+"'>"+options[loop]+"</option>\n";
  }
}
data += "</select><input type='hidden' id='"+name+"' name='"+name+"' value='"+value+"'>\n";

if(reference!=null)
{
  data += "<a href=\""+reference+"\" title=\"Go to reference data page.\"><img src=\"/OpenForum/Images/icons/gif/tag_green.gif\" border=\"0\"></a>\n";
}

data += "<script>\n";
data += "select = document.getElementById(\"_"+name+"\");\n";
data += "index = 0;\n";
data += "for(loop in select.options){\n";
data += "if(select.options[loop].value==\""+value+"\"){ index=loop;break; }\n";
data += " }\n";
data += "document.getElementById(\"_"+name+"\").\n";
data +=  "options[index].selected=true;\n";
data += "if(index==0){document.getElementById(\""+name+"\").value=select.options[0].value;}</script>\n"

return data;